# holi-chat-integration

This repository contains Google Cloud Functions implementation for the integration of Matrix Chat into holi. The cloud function

- can be found in the `src/index.ts`.
- and is triggered by events on Google Cloud Pub/Sub, emitted by Okuna on the `okuna_staging` and `okuna_production` topics, respectively

## Getting Started

### Local Development

#### Create Matrix Admin User

Please make sure that mprocs is running locally and that you are using the following Chat Server URL:
```bash
  http://127.0.0.1:8008/_synapse/admin/v1/register
  # ${CHAT_SERVER_URL}/_synapse/admin/v1/register
```

We will be following the steps described in the Synapse documentation on [how to create a Matrix Admin User](https://matrix-org.github.io/synapse/latest/admin_api/register_api.html).


1. Get Nonce:
<sub>Navigate to the following address to get a generated nonce:</sub>

```bash
GET http://127.0.0.1:8008/_synapse/admin/v1/register
```

2. Generate HMAC:
<sub>Run the following code in your terminal:</sub>

```bash
nonce="nonce_you_just_created"
username="admin"
password="admin"
admin="admin"
secret="shared_secret_in_passbolt"

printf '%s\0%s\0%s\0%s' "$nonce" "$username" "$password" "$admin" |
  openssl sha1 -hmac "$secret" |
  awk '{print $2}'
```

3. Create Admin user:
<sub>Finally, make this POST Request to the following URL:</sub>

```bash
POST http://127.0.0.1:8008/_synapse/admin/v1/register
{
   "nonce": "nonce_you_just_created",
   "username": "admin",
   "password": "admin",
   "admin": true,
   "mac": "hmac_you_just_created"
  }
```


## Links

- [Google Cloud Pub/Sub Topics](https://console.cloud.google.com/cloudpubsub/topic/list?project=holi-shared)
- [Google Cloud Functions](https://console.cloud.google.com/functions/list?env=gen2&project=holi-shared&tab=logs)

### Dependencies

Make sure that `jq` is installed before running the command. You can install it using the package manager of your choice:

- Ubuntu/Debian: `sudo apt-get install jq`
- macOS: `brew install jq`
- Windows: `chocolatey install jq`
