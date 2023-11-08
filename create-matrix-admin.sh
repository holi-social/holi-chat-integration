#!/bin/bash

# This file contains shell commands that are needed to create an admin for Matrix Chat
# which is needed to set up a working local dev environment for this project.

URL="http://127.0.0.1:8008/_synapse/admin/v1/register"
username="admin"
password="admin"
admin=true
secret=MATRIX_ADMIN_SECRET

# 1. Get Nonce
response=$(curl -s $URL)
nonce=$(jq -r ".nonce" <<<"$response")
echo "Nonce: $nonce"

# 2. Generate HMAC
hmac=$(
  echo "$nonce" "$username" "$password" "$admin" |
    openssl sha1 -hmac "$secret" |
    awk '{print $2}'
)
echo "HMAC: $hmac"

# 2. Create Matrix Admin
res=$(
  curl -s $URL -X POST \
    -H "Content-Type: application/json" \
    -d "{ \"nonce\": \"$nonce\", \"username\": \"$username\", \"password\": \"$password\", \"admin\": \"$admin\", \"mac\": \"$hmac\" }"
)
echo $res
