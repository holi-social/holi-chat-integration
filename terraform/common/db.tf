locals {
  ocis_integration_database_port = "5432"
}

# Development database configuratrion
data "google_secret_manager_secret_version_access" "ocis_integration_db_username_development" {
  secret  = "OCIS_INTEGRATION_DB_USERNAME_DEVELOPMENT"
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

data "google_secret_manager_secret_version_access" "ocis_integration_db_password_development" {
  secret  = "OCIS_INTEGRATION_DB_PASSWORD_DEVELOPMENT"
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

resource "google_sql_user" "ocis_integration_db_user_development" {
  name     = data.google_secret_manager_secret_version_access.ocis_integration_db_username_development.secret_data
  project  = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  instance = data.terraform_remote_state.holi_infra_state.outputs.database_name_development
  password = data.google_secret_manager_secret_version_access.ocis_integration_db_password_development.secret_data
}

resource "google_sql_database" "database_development" {
  name     = "ocis-integration-development"
  project  = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  instance = data.terraform_remote_state.holi_infra_state.outputs.database_name_development
}

# Production database configuration
data "google_secret_manager_secret_version_access" "ocis_integration_db_username_production" {
  secret  = "OCIS_INTEGRATION_DB_USERNAME_PRODUCTION"
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

data "google_secret_manager_secret_version_access" "ocis_integration_db_password_production" {
  secret  = "OCIS_INTEGRATION_DB_PASSWORD_PRODUCTION"
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

resource "google_sql_user" "ocis_integration_db_user_production" {
  name     = data.google_secret_manager_secret_version_access.ocis_integration_db_username_production.secret_data
  project  = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  instance = data.terraform_remote_state.holi_infra_state.outputs.database_name_production
  password = data.google_secret_manager_secret_version_access.ocis_integration_db_password_production.secret_data
}

resource "google_sql_database" "database_production" {
  name     = "ocis-integration-production"
  project  = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  instance = data.terraform_remote_state.holi_infra_state.outputs.database_name_production
}


