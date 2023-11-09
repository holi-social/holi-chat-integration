# holi-chat-integration

This repository contains Google Cloud Functions implementation for the integration of Matrix Chat into holi. The cloud function

- can be found in the `src/index.ts`.
- and is triggered by events on Google Cloud Pub/Sub, emitted by Okuna on the `okuna_staging` and `okuna_production` topics, respectively

## Getting Started

### Local Development

#### Create Matrix Admin User

In the holi-chat-server project, there is a script `create-synapse-admin-user.sh`` to create an admin user in Synapse. You can use it with the URL http://127.0.0.1:8008

Please make sure that mprocs is running locally and that you are using the following Chat Server URL:
```bash
  http://127.0.0.1:8008/_synapse/admin/v1/register
  # ${CHAT_SERVER_URL}/_synapse/admin/v1/register
```

The process is described in the Synapse documentation here: [how to create a Matrix Admin User](https://matrix-org.github.io/synapse/latest/admin_api/register_api.html).

## Links

- [Google Cloud Pub/Sub Topics](https://console.cloud.google.com/cloudpubsub/topic/list?project=holi-shared)
- [Google Cloud Functions](https://console.cloud.google.com/functions/list?env=gen2&project=holi-shared&tab=logs)
