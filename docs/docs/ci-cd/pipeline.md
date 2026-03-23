---
sidebar_position: 1
---

# Pipeline

The CI/CD pipeline runs on GitHub Actions using a **self-hosted macOS runner**. Every push triggers the full pipeline. Deployment to minikube only runs on `main`.

## Jobs

```
lint → type-check → test → build-and-scan → helm-lint → smoke-test → deploy (main only)
```

| Job | What it does |
|---|---|
| `lint` | ESLint on all `src/**/*.ts` files |
| `type-check` | `tsc --noEmit` — no emit, just type errors |
| `test` | Jest with coverage thresholds (80% statements/functions/lines, 75% branches) |
| `build-and-scan` | `docker build`, then Trivy image scan for CRITICAL/HIGH CVEs |
| `helm-lint` | `helm lint` on the chart |
| `smoke-test` | Loads the image into minikube, does `helm upgrade --wait`, port-forwards, runs `curl` health checks |
| `deploy` | Builds a short-SHA-tagged image, loads it into minikube, runs `helm upgrade --wait` |

## Trigger

```yaml
on:
  push:
    branches: ['**']
```

All branches get CI. Only `main` gets deployment.

## Self-hosted runner

The pipeline uses `runs-on: self-hosted` on all jobs. The runner is a macOS machine with Docker, minikube, kubectl, and Helm pre-installed.

### Setup

1. Go to **Settings → Actions → Runners → New self-hosted runner** in your GitHub repo.
2. Follow the instructions to download and configure the runner.
3. Start the runner:

```bash
cd actions-runner
./run.sh
```

Or register it as a launchd service to start on boot:

```bash
./svc.sh install
./svc.sh start
```

## Deployment

The deploy job:

1. Builds `timeserver:<short-sha>` (first 7 chars of commit SHA)
2. Loads the image into minikube with `minikube image load`
3. Runs `helm upgrade --install --wait timeserver helm/timeserver` with the new image tag
4. The `--wait` flag blocks until all pods are healthy before the job succeeds

## Secrets

No secrets are required for the current pipeline. If you add a `values.secret.yaml`, store it as a GitHub Actions secret and write it to disk in the deploy job before running helm.

## Node.js deprecation fix

All jobs set:

```yaml
env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
```

This suppresses the Node.js 20 deprecation warning from `actions/checkout` and `actions/setup-node`.
