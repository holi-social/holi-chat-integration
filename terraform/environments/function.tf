# see https://cloud.google.com/functions/docs/tutorials/terraform-pubsub

locals {
  # predefined environment names are staging, production, and <branchname>
  environment      = terraform.workspace
  environment_name = trim(substr(local.environment, 0, 22), ".-") # limits the length of the name that it fits constraints google imposes for some resources, e.g. project ids

  default_location = "europe-north1"
}

resource "random_id" "main" {
  byte_length = 2
  prefix      = "chat-integration-${local.environment_name}-"
}
resource "google_storage_bucket" "sources" {
  project                     = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name                        = random_id.main.hex
  location                    = local.default_location
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_object" "function_source" {
  name   = "receiveEvent.zip"
  bucket = google_storage_bucket.sources.name
  source = "../../receiveEvent.zip"
}

data "google_secret_manager_secret" "chat_admin_username" {
  secret_id = local.environment_name == "production" ? "CHAT_ADMIN_USERNAME_PRODUCTION" : "CHAT_ADMIN_USERNAME_DEVELOPMENT"
  project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

data "google_secret_manager_secret" "chat_admin_access_token" {
  secret_id = local.environment_name == "production" ? "CHAT_ADMIN_ACCESS_TOKEN_PRODUCTION" : "CHAT_ADMIN_ACCESS_TOKEN_DEVELOPMENT"
  project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

resource "google_cloudfunctions2_function" "holi-chat-integration" {
  project  = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name     = random_id.main.hex
  location = local.default_location

  build_config {
    runtime     = "nodejs18"
    entry_point = "receiveEvent"

    source {
      storage_source {
        bucket = google_storage_bucket.sources.name
        object = google_storage_bucket_object.function_source.name
      }
    }
  }

  service_config {
    max_instance_count               = 1
    min_instance_count               = local.environment_name == "production" ? 1 : 0
    available_memory                 = "200Mi"
    timeout_seconds                  = 120
    available_cpu                    = 1
    max_instance_request_concurrency = 20

    environment_variables = {
      ENVIRONMENT      = local.environment_name
      CHAT_SERVER_URL  = local.environment_name == "production" ? "https://chat.holi.social" : "https://development-chat.holi.social"
      CHAT_SERVER_NAME = local.environment_name == "production" ? "holi.social" : "development-chat.holi.social"
    }
    vpc_connector                  = data.terraform_remote_state.holi_infra_state.outputs.vpc_access_connector_name
    vpc_connector_egress_settings  = "PRIVATE_RANGES_ONLY"
    ingress_settings               = "ALLOW_INTERNAL_ONLY"
    all_traffic_on_latest_revision = true
    service_account_email          = data.terraform_remote_state.holi_chat_integration_common_state.outputs.function_service_account

    secret_environment_variables {
      key        = "CHAT_ADMIN_USERNAME"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret.chat_admin_username.secret_id
      version    = "latest"
    }

    secret_environment_variables {
      key        = "CHAT_ADMIN_ACCESS_TOKEN"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret.chat_admin_access_token.secret_id
      version    = "latest"
    }
  }

  # taken from https://github.com/hashicorp/terraform-provider-google/issues/1938#issuecomment-1229042663
  lifecycle {
    replace_triggered_by = [
      google_storage_bucket_object.function_source
    ]
  }
}
