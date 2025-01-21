locals {
  main_topic = local.is_production ? data.terraform_remote_state.okuna_common_state.outputs.google_pubsub_topic_okuna_production : data.terraform_remote_state.okuna_common_state.outputs.google_pubsub_topic_okuna_staging
  dlq_topic  = local.is_production ? data.terraform_remote_state.okuna_common_state.outputs.google_pubsub_topic_okuna_production_dlq : data.terraform_remote_state.okuna_common_state.outputs.google_pubsub_topic_okuna_staging_dlq

  max_attemts = 10
  min_backoff = "2s"
  max_backoff = "10s"
}

resource "google_pubsub_subscription" "holi-chat-integration-okuna-sub" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name    = random_id.main.hex
  topic   = local.main_topic

  ack_deadline_seconds = 10 * 60 # 10 minutes, max. value
  expiration_policy {
    ttl = "" # never expire
  }

  push_config {
    push_endpoint = google_cloudfunctions2_function.holi-chat-integration.service_config[0].uri

    oidc_token {
      service_account_email = data.terraform_remote_state.holi_chat_integration_common_state.outputs.function_service_account
    }
  }

  retry_policy {
    minimum_backoff = local.min_backoff
    maximum_backoff = local.max_backoff
  }

  dead_letter_policy {
    dead_letter_topic     = local.dlq_topic
    max_delivery_attempts = local.max_attemts
  }
}
