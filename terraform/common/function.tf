# see https://cloud.google.com/functions/docs/tutorials/terraform-pubsub

resource "random_id" "bucket_prefix" {
  byte_length = 8
}

resource "google_service_account" "account" {
  project      = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  account_id   = "holi-ocis-integration-sa"
  display_name = "holi-ocis-integration Service Account"
}
resource "google_project_iam_member" "secretmanager_accessor" {
  for_each = toset([
    "serviceAccount:service-984061681268@gcf-admin-robot.iam.gserviceaccount.com",
    "serviceAccount:984061681268@cloudbuild.gserviceaccount.com",
    "serviceAccount:holi-ocis-integration-sa@holi-shared.iam.gserviceaccount.com",
  ])
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member  = each.key
  role    = "roles/secretmanager.secretAccessor"
}

resource "google_project_iam_member" "cloudsql_client" {
  for_each = toset([
    "serviceAccount:service-984061681268@gcf-admin-robot.iam.gserviceaccount.com",
    "serviceAccount:984061681268@cloudbuild.gserviceaccount.com",
    "serviceAccount:holi-ocis-integration-sa@holi-shared.iam.gserviceaccount.com",
  ])
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member  = each.key
  role    = "roles/cloudsql.client"
}

resource "google_project_iam_member" "function_invoker" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member  = "serviceAccount:holi-ocis-integration-sa@holi-shared.iam.gserviceaccount.com"
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

data "google_secret_manager_secret" "ocis_admin_username_development" {
  secret_id = "OCIS_ADMIN_USERNAME_DEVELOPMENT"
  project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

data "google_secret_manager_secret" "ocis_admin_password_development" {
  secret_id = "OCIS_ADMIN_PASSWORD_DEVELOPMENT"
  project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

data "google_secret_manager_secret" "ocis_admin_username_production" {
  secret_id = "OCIS_ADMIN_USERNAME_PRODUCTION"
  project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

data "google_secret_manager_secret" "ocis_admin_password_production" {
  secret_id = "OCIS_ADMIN_PASSWORD_PRODUCTION"
  project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

resource "google_cloudfunctions2_function" "holi-ocis-integration-staging" {
  project     = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name        = "holi-ocis-integration-staging"
  location    = "europe-north1"
  description = "holi-ocis-integration-staging function"

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
      OCIS_OIDC_ISSUER             = "https://dev-auth.holi.social"
      OWNCLOUD_BASE_URL            = "https://development.cloud.holi.social"
      OCIS_INTEGRATION_DB_HOST     = data.terraform_remote_state.holi_infra_state.outputs.database_ip_address_development
      OCIS_INTEGRATION_DB_PORT     = local.ocis_integration_database_port
      OCIS_INTEGRATION_DB_NAME     = google_sql_database.database_development.name
      OCIS_INTEGRATION_DB_USERNAME = google_sql_user.ocis_integration_db_user_development.name
      OCIS_INTEGRATION_DB_PASSWORD = google_sql_user.ocis_integration_db_user_development.password
      INSTANCE_CONNECTION_NAME     = data.terraform_remote_state.holi_infra_state.outputs.database_name_development
    }
    vpc_connector                  = data.terraform_remote_state.holi_infra_state.outputs.vpc_access_connector_name
    vpc_connector_egress_settings  = "PRIVATE_RANGES_ONLY"
    ingress_settings               = "ALLOW_INTERNAL_ONLY"
    all_traffic_on_latest_revision = true
    service_account_email          = google_service_account.account.email

    secret_environment_variables {
      key        = "OCIS_ADMIN_USERNAME"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret.ocis_admin_username_development.secret_id
      version    = "latest"
    }

    secret_environment_variables {
      key        = "OCIS_ADMIN_PASSWORD"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret.ocis_admin_password_development.secret_id
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

resource "google_cloudfunctions2_function" "holi-ocis-integration-production" {
  project     = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name        = "holi-ocis-integration-production"
  location    = "europe-north1"
  description = "holi-ocis-integration-production function"

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
    max_instance_count = 3
    min_instance_count = 0
    available_memory   = "128Mi"
    timeout_seconds    = 60
    environment_variables = {
      ENVIRONMENT                  = "production"
      OCIS_OIDC_ISSUER             = "https://auth.holi.social"
      OWNCLOUD_BASE_URL            = "https://production.cloud.holi.social"
      OCIS_INTEGRATION_DB_HOST     = data.terraform_remote_state.holi_infra_state.outputs.database_ip_address_production
      OCIS_INTEGRATION_DB_PORT     = local.ocis_integration_database_port
      OCIS_INTEGRATION_DB_NAME     = google_sql_database.database_production.name
      OCIS_INTEGRATION_DB_USERNAME = google_sql_user.ocis_integration_db_user_production.name
      OCIS_INTEGRATION_DB_PASSWORD = google_sql_user.ocis_integration_db_user_production.password
      INSTANCE_CONNECTION_NAME     = data.terraform_remote_state.holi_infra_state.outputs.database_name_production
    }
    vpc_connector                  = data.terraform_remote_state.holi_infra_state.outputs.vpc_access_connector_name
    vpc_connector_egress_settings  = "PRIVATE_RANGES_ONLY"
    ingress_settings               = "ALLOW_INTERNAL_ONLY"
    all_traffic_on_latest_revision = true
    service_account_email          = google_service_account.account.email

    secret_environment_variables {
      key        = "OCIS_ADMIN_USERNAME"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret.ocis_admin_username_production.secret_id
      version    = "latest"
    }

    secret_environment_variables {
      key        = "OCIS_ADMIN_PASSWORD"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret.ocis_admin_password_production.secret_id
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
