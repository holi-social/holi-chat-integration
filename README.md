# holi-chat-integration

This repository contains Google Cloud Functions implementation for the integration of Matrix Chat into holi. The cloud function

- can be found in the `src/index.ts`.
- and is triggered by events on Google Cloud Pub/Sub, emitted by Okuna on the `okuna_staging` and `okuna_production` topics, respectively

## Getting Started

### Local Development

#### Create Matrix Admin User

Follow the steps in the below Synapse documentation link on how to create your Matrix Admin User.
- [Synapse Create Admin](https://matrix-org.github.io/synapse/latest/admin_api/register_api.html)

For the first step when fetching the **nonce** make sure that mprocs is running and that you are using the following Chat Server URL:

```bash
  # ${CHAT_SERVER_URL}/_synapse/admin/v1/register
  http://127.0.0.1:8008/_synapse/admin/v1/register
```

Once we generate the HMAC as described in the documentation, the **nonce** can be used to do the PUT Request to get the admin user name and access token.

## Links

- [Google Cloud Pub/Sub Topics](https://console.cloud.google.com/cloudpubsub/topic/list?project=holi-shared)
- [Google Cloud Functions](https://console.cloud.google.com/functions/list?env=gen2&project=holi-shared&tab=logs)

### Dependencies

Make sure that `jq` is installed before running the command. You can install it using the package manager of your choice:

- Ubuntu/Debian: `sudo apt-get install jq`
- macOS: `brew install jq`
- Windows: `chocolatey install jq`
