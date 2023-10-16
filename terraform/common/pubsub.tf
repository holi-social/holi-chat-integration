resource "google_project_iam_member" "pubsub_subscriber" {
  for_each = toset([
    "serviceAccount:service-984061681268@gcf-admin-robot.iam.gserviceaccount.com",
    "serviceAccount:984061681268@cloudbuild.gserviceaccount.com",
    "serviceAccount:holi-ocis-integration-sa@holi-shared.iam.gserviceaccount.com",
  ])
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member  = each.key
  role    = "roles/pubsub.subscriber"
}

resource "google_project_iam_member" "pubsub_publisher" {
  for_each = toset([
    "serviceAccount:service-984061681268@gcf-admin-robot.iam.gserviceaccount.com",
    "serviceAccount:984061681268@cloudbuild.gserviceaccount.com",
    "serviceAccount:holi-ocis-integration-sa@holi-shared.iam.gserviceaccount.com",
  ])
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member  = each.key
  role    = "roles/pubsub.publisher"
}

resource "google_pubsub_subscription" "holi-ocis-integration-okuna-staging-sub" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name    = "holi-ocis-integration-okuna-staging-sub"
  topic   = data.terraform_remote_state.okuna-common_state.outputs.google_pubsub_topic_okuna_staging

  ack_deadline_seconds = 10 * 60 # 10 minutes, max. value
  expiration_policy {
    ttl = "" # never expire
  }

  push_config {
    push_endpoint = google_cloudfunctions2_function.holi-ocis-integration-staging.service_config[0].uri

    oidc_token {
      service_account_email = google_service_account.account.email
    }
  }
}

resource "google_pubsub_subscription" "holi-ocis-integration-okuna-production-sub" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name    = "holi-ocis-integration-okuna-production-sub"
  topic   = data.terraform_remote_state.okuna-common_state.outputs.google_pubsub_topic_okuna_production

  ack_deadline_seconds = 10 * 60 # 10 minutes, max. value
  expiration_policy {
    ttl = "" # never expire
  }

  push_config {
    push_endpoint = google_cloudfunctions2_function.holi-ocis-integration-production.service_config[0].uri

    oidc_token {
      service_account_email = google_service_account.account.email
    }
  }
}
