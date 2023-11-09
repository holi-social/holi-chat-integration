terraform {
  backend "gcs" {
    bucket = "holi-shared-terraform-state"
    prefix = "chat-integration-environments"
  }
}

data "terraform_remote_state" "holi_chat_integration_common_state" {
  backend = "gcs"
  config = {
    bucket = "holi-shared-terraform-state"
    prefix = "chat-integration-common"
  }
}

data "terraform_remote_state" "holi_infra_state" {
  backend = "gcs"
  config = {
    bucket = "holi-shared-terraform-state"
    prefix = "infra"
  }
}

data "terraform_remote_state" "okuna-common_state" {
  backend = "gcs"
  config = {
    bucket = "holi-shared-terraform-state"
    prefix = "okuna-common"
  }
}

# provider google including beta features
provider "google" {
  region = "europe-north1"
}

provider "google-beta" {
  region = "europe-north1"
}
