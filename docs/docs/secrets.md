---
sidebar_position: 8
---

# Secrets

Sensitive values (API keys, credentials, etc.) are managed via Kubernetes Secrets and never committed to the repository.

## Pattern

1. A `values.secret.yaml.example` file is committed — it shows the structure with placeholder values.
2. The actual `values.secret.yaml` is gitignored.
3. At deploy time, pass the real file to Helm with `-f`.

## Setup

Copy the example and fill in your values:

```bash
cp helm/timeserver/values.secret.yaml.example helm/timeserver/values.secret.yaml
# edit values.secret.yaml with real values
```

## Install with secrets

```bash
helm install timeserver helm/timeserver \
  -f helm/timeserver/values.secret.yaml
```

## values.secret.yaml structure

```yaml
secret:
  create: true
  data:
    MY_SECRET_KEY: "my-secret-value"
    ANOTHER_SECRET: "another-value"
```

## How it works

When `secret.create` is `true`, the chart creates a Kubernetes Secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: timeserver-secret
type: Opaque
stringData:
  MY_SECRET_KEY: "my-secret-value"
```

The Secret is mounted into the pod via `envFrom`:

```yaml
envFrom:
  - configMapRef:
      name: timeserver-config
  - secretRef:
      name: timeserver-secret
```

All keys from the Secret become environment variables in the container.

## What NOT to put in secrets

The following are config (not secrets) and belong in `values.yaml` under `config:`:

- `PORT`
- `NODE_ENV`
- `LOG_LEVEL`

Use secrets only for values that must not appear in git or logs: API keys, passwords, tokens, private endpoints.

## CI/CD

For the GitHub Actions pipeline, store the contents of `values.secret.yaml` as a GitHub Actions secret, then write it to disk in the deploy job:

```yaml
- name: Write secret values
  run: echo "${{ secrets.HELM_SECRET_VALUES }}" > helm/timeserver/values.secret.yaml

- name: Deploy
  run: |
    helm upgrade --install timeserver helm/timeserver \
      -f helm/timeserver/values.secret.yaml \
      --set image.tag=${{ env.SHORT_SHA }}
```
