#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:8888}"
COLLECTION="$(dirname "$0")/timeserver.postman_collection.json"

echo "Running smoke tests against: $BASE_URL"

npx newman run "$COLLECTION" \
  --env-var "baseUrl=$BASE_URL" \
  --reporters cli \
  --color on
