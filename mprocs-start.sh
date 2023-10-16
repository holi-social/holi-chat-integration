#!/bin/bash

# This file is used by the mprocs yaml files in https://gitlab.holi.team/app/holi-meta

. ./.envrc.local
./start-chat-integration-local.sh
yarn build
yarn start:dev
