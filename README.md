# holi-ocis-integration

This repository contains Google Cloud Functions implementation for the integration of OwnCloud Infinite Storage (OCIS) into holi. The cloud function

- can be found in the `src/index.ts`.
- and is triggered by events on Google Cloud Pub/Sub, emitted by Okuna on the `okuna_staging` and `okuna_production` topics, respectively

## Links

- [Google Cloud Pub/Sub Topics](https://console.cloud.google.com/cloudpubsub/topic/list?project=holi-shared)
- [Google Cloud Functions](https://console.cloud.google.com/functions/list?env=gen2&project=holi-shared&tab=logs)

## Database

`holi-ocis-integration` depends on a database that serves as a repository for various identifiers that can be associated with entities within the ownCloud. This database serves as a crucial component for the seamless functioning of this repository by providing a structured and organized approach to mapping these identifiers to the relevant entities.
Locally, the database is running within a Docker container on port 8087.

### Dependencies

Make sure that `jq` is installed before running the command. You can install it using the package manager of your choice:

- Ubuntu/Debian: `sudo apt-get install jq`
- macOS: `brew install jq`
- Windows: `chocolatey install jq`
