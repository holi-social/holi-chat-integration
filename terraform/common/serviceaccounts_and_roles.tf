# see https://cloud.google.com/functions/docs/tutorials/terraform-pubsub

resource "google_service_account" "chat_integration" {
  project      = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  account_id   = "holi-chat-integration-sa"
  display_name = "holi-chat-integration Service Account"
}

locals {
  service_account_ids = {
    cloudfunctions_admin_robot = "service-984061681268@gcf-admin-robot.iam.gserviceaccount.com"
    cloudbuild                 = "984061681268@cloudbuild.gserviceaccount.com"
    chat_integration           = google_service_account.chat_integration.email
  }
}

resource "google_project_iam_member" "secretmanager_accessor" {
  for_each = local.service_account_ids
  project  = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member   = "serviceAccount:${each.value}"
  role     = "roles/secretmanager.secretAccessor"
}

resource "google_project_iam_member" "cloudsql_client" {
  for_each = local.service_account_ids
  project  = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member   = "serviceAccount:${each.value}"
  role     = "roles/cloudsql.client"
}

resource "google_project_iam_member" "function_invoker" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member  = "serviceAccount:${local.service_account_ids.chat_integration}"
  role    = "roles/run.invoker"
}

output "function_service_account" {
  value = local.service_account_ids.chat_integration
}
