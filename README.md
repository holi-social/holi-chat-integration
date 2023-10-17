# holi-chat-integration

This repository contains Google Cloud Functions implementation for the integration of Matrix Chat into holi. The cloud function

- can be found in the `src/index.ts`.
- and is triggered by events on Google Cloud Pub/Sub, emitted by Okuna on the `okuna_staging` and `okuna_production` topics, respectively

## Links

- [Google Cloud Pub/Sub Topics](https://console.cloud.google.com/cloudpubsub/topic/list?project=holi-shared)
- [Google Cloud Functions](https://console.cloud.google.com/functions/list?env=gen2&project=holi-shared&tab=logs)

### Dependencies

Make sure that `jq` is installed before running the command. You can install it using the package manager of your choice:

- Ubuntu/Debian: `sudo apt-get install jq`
- macOS: `brew install jq`
- Windows: `chocolatey install jq`
