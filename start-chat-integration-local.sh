#!/bin/bash

# This script checks if the docker container $DB_CONTAINER_NAME exists
# If it is running: do nothing, if it's stopped: start it, otherwise create a new container with the same name.

CONTAINER_NAME=$DB_CONTAINER_NAME

if [ -z "$CONTAINER_NAME" ]; then
  echo "No DB_CONTAINER_NAME is set. Doing nothing."
  exit 0
fi

if docker ps -a --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
  if docker ps -a --filter "name=$CONTAINER_NAME" --filter "status=running" --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    echo "Container $CONTAINER_NAME is already running."
  else
    echo "Starting container $CONTAINER_NAME..."
    docker start $CONTAINER_NAME
  fi
else
  echo "Creating new container $CONTAINER_NAME..."
  docker run --name $CONTAINER_NAME \
  -e POSTGRES_USER=$OCIS_INTEGRATION_DB_USERNAME \
  -e POSTGRES_PASSWORD=$OCIS_INTEGRATION_DB_PASSWORD \
  -e POSTGRES_DB=$OCIS_INTEGRATION_DB_NAME \
  -p $OCIS_INTEGRATION_DB_PORT:5432 \
  -d postgres
fi
