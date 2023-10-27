# see https://cloud.google.com/functions/docs/tutorials/terraform-pubsub

resource "random_id" "bucket_prefix" {
  byte_length = 8
}

resource "google_service_account" "account" {
  project      = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  account_id   = "holi-chat-integration-sa"
  display_name = "holi-chat-integration Service Account"
}
resource "google_project_iam_member" "secretmanager_accessor" {
  for_each = toset([
    "serviceAccount:service-984061681268@gcf-admin-robot.iam.gserviceaccount.com",
    "serviceAccount:984061681268@cloudbuild.gserviceaccount.com",
    "serviceAccount:holi-chat-integration-sa@holi-shared.iam.gserviceaccount.com",
  ])
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member  = each.key
  role    = "roles/secretmanager.secretAccessor"
}

resource "google_project_iam_member" "cloudsql_client" {
  for_each = toset([
    "serviceAccount:service-984061681268@gcf-admin-robot.iam.gserviceaccount.com",
    "serviceAccount:984061681268@cloudbuild.gserviceaccount.com",
    "serviceAccount:holi-chat-integration-sa@holi-shared.iam.gserviceaccount.com",
  ])
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member  = each.key
  role    = "roles/cloudsql.client"
}

resource "google_project_iam_member" "function_invoker" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member  = "serviceAccount:holi-chat-integration-sa@holi-shared.iam.gserviceaccount.com"
  role    = "roles/run.invoker"
}

resource "google_storage_bucket" "bucket" {
  project                     = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name                        = "${random_id.bucket_prefix.hex}-gcf-source"
  location                    = "europe-north1"
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_object" "function_source" {
  name   = "receiveEvent.zip"
  bucket = google_storage_bucket.bucket.name
  source = "../../receiveEvent.zip"
}

data "google_secret_manager_secret" "chat_admin_username_development" {
  secret_id = "CHAT_ADMIN_USERNAME_DEVELOPMENT"
  project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

data "google_secret_manager_secret" "chat_admin_access_token_development" {
  secret_id = "CHAT_ADMIN_ACCESS_TOKEN_DEVELOPMENT"
  project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

# data "google_secret_manager_secret" "chat_admin_username_production" {
#   secret_id = "CHAT_ADMIN_USERNAME_PRODUCTION"
#   project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
# }

# data "google_secret_manager_secret" "chat_admin_access_token_production" {
#   secret_id = "CHAT_ADMIN_ACCESS_TOKEN_PRODUCTION"
#   project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
# }

resource "google_cloudfunctions2_function" "holi-chat-integration-staging" {
  project     = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name        = "holi-chat-integration-staging"
  location    = "europe-north1"
  description = "holi-chat-integration-staging function"

  build_config {
    runtime     = "nodejs18"
    entry_point = "receiveEvent"

    source {
      storage_source {
        bucket = google_storage_bucket.bucket.name
        object = google_storage_bucket_object.function_source.name
      }
    }
  }

  service_config {
    max_instance_count = 1
    min_instance_count = 0
    available_memory   = "128Mi"
    timeout_seconds    = 60
    environment_variables = {
      ENVIRONMENT                  = "staging"
      CHAT_OIDC_ISSUER             = "https://dev-auth.holi.social"
      CHAT_SERVER_URL              = "https://development-chat.holi.social"
      CHAT_SERVER_NAME             = "development-chat.holi.social"
    }
    vpc_connector                  = data.terraform_remote_state.holi_infra_state.outputs.vpc_access_connector_name
    vpc_connector_egress_settings  = "PRIVATE_RANGES_ONLY"
    ingress_settings               = "ALLOW_INTERNAL_ONLY"
    all_traffic_on_latest_revision = true
    service_account_email          = google_service_account.account.email

    secret_environment_variables {
      key        = "CHAT_ADMIN_USERNAME"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret.chat_admin_username_development.secret_id
      version    = "latest"
    }

    secret_environment_variables {
      key        = "CHAT_ADMIN_ACCESS_TOKEN"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret.chat_admin_access_token_development.secret_id
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

# resource "google_cloudfunctions2_function" "holi-chat-integration-production" {
#   project     = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
#   name        = "holi-chat-integration-production"
#   location    = "europe-north1"
#   description = "holi-chat-integration-production function"

#   build_config {
#     runtime     = "nodejs18"
#     entry_point = "receiveEvent"

#     source {
#       storage_source {
#         bucket = google_storage_bucket.bucket.name
#         object = google_storage_bucket_object.function_source.name
#       }
#     }
#   }

#   service_config {
#     max_instance_count = 3
#     min_instance_count = 0
#     available_memory   = "128Mi"
#     timeout_seconds    = 60
#     environment_variables = {
#       ENVIRONMENT                  = "production"
#       CHAT_OIDC_ISSUER             = "https://auth.holi.social"
#       CHAT_SERVER_URL              = "https://chat.holi.social"
#       CHAT_SERVER_NAME             = "chat.holi.social"
#     }
#     vpc_connector                  = data.terraform_remote_state.holi_infra_state.outputs.vpc_access_connector_name
#     vpc_connector_egress_settings  = "PRIVATE_RANGES_ONLY"
#     ingress_settings               = "ALLOW_INTERNAL_ONLY"
#     all_traffic_on_latest_revision = true
#     service_account_email          = google_service_account.account.email

#     secret_environment_variables {
#       key        = "CHAT_ADMIN_USERNAME"
#       project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
#       secret     = data.google_secret_manager_secret.chat_admin_username_production.secret_id
#       version    = "latest"
#     }

#     secret_environment_variables {
#       key        = "CHAT_ADMIN_ACCESS_TOKEN"
#       project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
#       secret     = data.google_secret_manager_secret.chat_admin_access_token_production.secret_id
#       version    = "latest"
#     }
#   }

#   # taken from https://github.com/hashicorp/terraform-provider-google/issues/1938#issuecomment-1229042663
#   lifecycle {
#     replace_triggered_by = [
#       google_storage_bucket_object.function_source
#     ]
#   }
# }
