#!/bin/bash

# start Apollo Router

cwd=$(pwd)

docker run -p 4000:4000 \
  --env APOLLO_TELEMETRY_DISABLED=true \
  --mount "type=bind,source=$cwd/router.yaml,target=/dist/router.yaml" \
  --mount "type=bind,source=$cwd/supergraph.gql,target=/dist/supergraph.gql" \
  --rm ghcr.io/apollographql/router:v1.24.0 \
  --dev \
  -s /dist/supergraph.gql \
  -c /dist/router.yaml
