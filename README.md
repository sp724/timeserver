# timeserver

A Node.js/TypeScript REST API that returns the current time in 5 timezones: Toronto, London, Mumbai, Tokyo, and Sydney.

**[Documentation](https://sp724.github.io/timeserver/)** | **[Source](https://github.com/sp724/timeserver)**

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20.x | Use `nvm use` (reads `.nvmrc`) |
| Docker | Any recent | Required for container steps |
| minikube | Any recent | Required for Kubernetes steps |
| kubectl | Any recent | Required for Kubernetes steps |
| Helm | v3+ | Required for Kubernetes steps |

---

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health/live` | Liveness probe — returns `status: "ok"` and uptime; Kubernetes restarts pod if this fails |
| `GET` | `/health/ready` | Readiness probe — returns `status: "ok"`; Kubernetes removes pod from load balancer if this fails |
| `GET` | `/metrics` | Prometheus metrics scrape endpoint (request counts, durations, Node.js process metrics) |
| `GET` | `/api/v1/time` | Current time in all 5 cities; optional `?cities=toronto,sydney` to filter (rate limited: 100 req/min per IP) |
| `GET` | `/api/docs` | Interactive OpenAPI documentation (Swagger UI) |

### Sample Responses

**GET /health/live**
```json
{
  "status": "ok",
  "uptime": 42.3,
  "timestamp": "2026-03-21T02:00:00.000Z"
}
```

**GET /health/ready**
```json
{
  "status": "ok",
  "timestamp": "2026-03-21T02:00:00.000Z"
}
```

**GET /api/v1/time**
```json
{
  "toronto": "2026-03-20, 22:00:00",
  "london":  "2026-03-21, 02:00:00",
  "mumbai":  "2026-03-21, 07:30:00",
  "tokyo":   "2026-03-21, 11:00:00",
  "sydney":  "2026-03-21, 13:00:00",
  "generatedAt": "2026-03-21T02:00:00.000Z"
}
```

---

## Local Development

### Install dependencies

```bash
nvm use          # switch to Node 20 via .nvmrc
npm install
```

### Run in development mode (ts-node, no compile step)

```bash
npm run dev
```

### Build and run compiled output

```bash
npm run build
npm start
```

The server listens on port `8888` by default. Override with `PORT`:

```bash
PORT=9000 npm start
```

---

## Unit Tests

```bash
npm test
```

Runs Jest with coverage reporting. Enforced thresholds:

| Metric | Threshold |
|---|---|
| Statements | 80% |
| Functions | 80% |
| Lines | 80% |
| Branches | 75% |

Coverage report is written to `coverage/` after each run.

---

## Smoke Tests (Newman/Postman)

Smoke tests require a running server. Start one first, then run:

```bash
# Terminal 1
npm start

# Terminal 2
npm run smoke-test
```

To run against a specific URL (e.g. a deployed instance):

```bash
bash tests/smoke/run-smoke-tests.sh http://your-host:8888
```

The collection is at `tests/smoke/timeserver.postman_collection.json` and can also be imported directly into Postman.

---

## Docker

### Build the image

```bash
docker build -t timeserver:latest .
```

### Run the container

```bash
docker run -d -p 8888:8888 --name timeserver timeserver:latest
```

### Verify

```bash
curl http://localhost:8888/health
curl http://localhost:8888/api/v1/time
```

### Stop and remove

```bash
docker stop timeserver && docker rm timeserver
```

---

## Docker Compose

Bring up the full local stack — timeserver, Prometheus, and Grafana — with a single command. No minikube required.

```bash
docker compose up --build -d
# or
make compose-up
```

| Service | URL | Credentials |
|---|---|---|
| timeserver | http://localhost:8888 | — |
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3000 | `admin` / `admin` |

Prometheus is pre-configured to scrape `/metrics`. Grafana auto-provisions the Prometheus datasource on startup.

```bash
make compose-down   # stop and remove
make compose-logs   # tail logs
```

---

## Makefile

Common workflows wrapped as `make` targets:

```bash
make dev            # run with ts-node (no compile step)
make test           # jest with coverage
make lint           # eslint
make build          # tsc → dist/
make docker-build   # build image tagged with git SHA
make compose-up     # start docker-compose stack
make deploy         # build → minikube load → helm upgrade --wait
make smoke-test     # run Newman smoke tests
make help           # list all targets
```

Override defaults:

```bash
make deploy IMAGE=myrepo/timeserver TAG=v2
```

---

## Minikube Deployment (Helm)

### 1. Start minikube

```bash
minikube start --driver=docker
```

### 2. Build the Docker image

```bash
docker build -t timeserver:latest .
```

### 3. Load the image into minikube

```bash
minikube image load timeserver:latest
```

> The Helm chart sets `imagePullPolicy: Never` — minikube uses the locally loaded image rather than pulling from a registry.

### 4. Install the Helm chart

```bash
helm install timeserver ./helm/timeserver
```

### 5. Wait for the pod to be ready

```bash
kubectl rollout status deployment/timeserver-timeserver
```

### 6. Verify the deployment

```bash
kubectl get pods,svc
```

Expected output:
```
NAME                                          READY   STATUS    RESTARTS   AGE
pod/timeserver-timeserver-<hash>              1/1     Running   0          30s

NAME                            TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)          AGE
service/timeserver-timeserver   NodePort    10.x.x.x       <none>        8888:3xxxx/TCP   30s
```

### 7. Access the service

On macOS with the Docker driver, the minikube IP is not directly reachable. Use `kubectl port-forward`:

```bash
kubectl port-forward svc/timeserver-timeserver 8888:8888
```

Then in another terminal:

```bash
curl http://localhost:8888/health
curl http://localhost:8888/api/v1/time
```

Alternatively you can run minikube service and a new url will be generated

```bash
minikube service timeserver-timeserver --url
http://127.0.0.1:63412
```

Then run:

```bash
curl http://127.0.0.1:63412/health
curl http://127.0.0.1:63412/api/v1/time
```

### 8. Run smoke tests against the deployed service

With `port-forward` running in the background:

```bash
npm run smoke-test
# or with an explicit URL:
bash tests/smoke/run-smoke-tests.sh http://localhost:8888
```

### 9. Teardown

```bash
helm uninstall timeserver
```

---

## Redeploying Changes

The `make deploy` target handles the full redeploy — it builds a new image tagged with the current git SHA, loads it into minikube, and runs `helm upgrade --wait`:

```bash
make deploy
```

Or manually with a specific tag:

```bash
docker build -t timeserver:v2 .
minikube image load timeserver:v2
helm upgrade timeserver ./helm/timeserver --set image.tag=v2 --wait
```

### Rollback

If something goes wrong, Helm keeps a full revision history:

```bash
helm rollback timeserver        # roll back to the previous revision
helm history timeserver         # view all revisions
```

---

## Project Structure

```
timeserver/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI/CD pipeline (self-hosted runner)
│       └── docs.yml                  # Deploy Docusaurus site to GitHub Pages
├── .husky/
│   └── pre-commit                    # Runs lint-staged before every commit
├── src/
│   ├── config.ts                     # Zod env var validation (fails fast on bad config)
│   ├── types.ts                      # Shared TypeScript interfaces
│   ├── timeService.ts                # Timezone formatting logic
│   ├── server.ts                     # Express app and route handlers
│   ├── swagger.ts                    # OpenAPI spec (served at /api/docs)
│   └── __tests__/
│       ├── config.test.ts            # Config schema tests
│       ├── timeService.test.ts       # Unit tests for time formatting
│       └── server.test.ts            # Integration tests via supertest
├── tests/
│   └── smoke/
│       ├── timeserver.postman_collection.json
│       └── run-smoke-tests.sh
├── helm/
│   └── timeserver/
│       ├── Chart.yaml
│       ├── values.yaml               # Default values (no secrets)
│       ├── values.secret.yaml.example  # Template for gitignored secrets file
│       └── templates/
│           ├── _helpers.tpl
│           ├── configmap.yaml        # PORT, NODE_ENV
│           ├── secret.yaml           # Optional Kubernetes Secret (secret.create)
│           ├── deployment.yaml
│           ├── service.yaml
│           ├── hpa.yaml              # Horizontal Pod Autoscaler (autoscaling.enabled)
│           ├── pdb.yaml              # Pod Disruption Budget (podDisruptionBudget.enabled)
│           ├── networkpolicy.yaml    # Network Policy (networkPolicy.enabled)
│           ├── resourcequota.yaml    # Resource Quota (resourceQuota.enabled)
│           └── servicemonitor.yaml   # Prometheus ServiceMonitor
├── docker/
│   ├── prometheus/
│   │   └── prometheus.yml            # Prometheus scrape config for compose stack
│   └── grafana/
│       └── provisioning/
│           └── datasources/
│               └── prometheus.yml    # Auto-provisions Prometheus datasource in Grafana
├── docs/                             # Docusaurus documentation site (GitHub Pages)
├── .nvmrc                            # Pins Node 20
├── .dockerignore
├── .gitignore
├── docker-compose.yml                # Full local stack: timeserver + Prometheus + Grafana
├── Dockerfile                        # Multi-stage build with apk upgrade + npm upgrade
├── eslint.config.mjs                 # ESLint flat config with @typescript-eslint
├── Makefile                          # Common dev/build/deploy workflows
├── package.json
└── tsconfig.json
```

---

## Configuration

| Environment Variable | Default | Description |
|---|---|---|
| `PORT` | `8888` | Port the server listens on |
| `NODE_ENV` | — | Set to `production` in Docker/Kubernetes |
| `LOG_LEVEL` | `info` (prod) / `silent` (test) | Pino log level: `trace`, `debug`, `info`, `warn`, `error`, `silent` |
| `OTEL_ENABLED` | `false` | Set to `true` to enable OpenTelemetry tracing |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | — | OTLP collector URL (e.g. `http://jaeger:4318`) — used when `OTEL_ENABLED=true` |

---

## Observability

### Structured Logging

Logs are emitted as JSON via `pino`. Every request log line includes the request ID, method, URL, status code, and duration. Set the log level with the `LOG_LEVEL` env var:

```bash
LOG_LEVEL=debug npm start
```

Example log line:
```json
{ "level": 30, "service": "timeserver", "reqId": "a1b2-...", "req": { "method": "GET", "url": "/api/v1/time" }, "res": { "statusCode": 200 }, "responseTime": 12 }
```

### Request ID Propagation

Every response includes an `X-Request-ID` header. Pass your own ID in the request to correlate client and server logs:

```bash
curl -H "X-Request-ID: my-trace-123" http://localhost:8888/api/v1/time
# Response includes: X-Request-ID: my-trace-123
```

### Prometheus Metrics

The `/metrics` endpoint exposes metrics in Prometheus text format:

```bash
curl http://localhost:8888/metrics
```

Key metrics collected:
- `http_requests_total` — request count by method, route, and status code
- `http_request_duration_ms` — request latency histogram
- Node.js process metrics (memory, CPU, event loop lag, GC)

### Distributed Tracing (OpenTelemetry)

Tracing is off by default. Enable it with `OTEL_ENABLED=true`:

```bash
OTEL_ENABLED=true npm start
```

Traces are written to stdout (console exporter) for local development. In production, swap the exporter for an OTLP endpoint (Jaeger, Tempo, Datadog, etc.) by setting:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-collector:4318
```

### Grafana + Prometheus on Minikube

#### 1. Install the monitoring stack

```bash
# Add the Prometheus community chart repo (skip if already added)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus, Grafana, and Alertmanager into a dedicated namespace
kubectl create namespace monitoring
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring

# Wait for all pods to be ready
kubectl get pods -n monitoring -w
```

The `ServiceMonitor` is already included in the timeserver Helm chart — Prometheus will automatically discover and scrape the `/metrics` endpoint once the stack is running.

#### 2. Verify Prometheus discovered the timeserver

```bash
# Confirm the ServiceMonitor is registered
kubectl get servicemonitor -n default

# If the target doesn't appear in the Prometheus UI immediately, restart Prometheus
kubectl rollout restart statefulset/prometheus-kube-prometheus-stack-prometheus -n monitoring
kubectl rollout status statefulset/prometheus-kube-prometheus-stack-prometheus -n monitoring
```

#### 3. Port-forward all three services

Run each command in a **separate terminal** — they must stay running:

```bash
# Terminal 1 — timeserver API
kubectl port-forward svc/timeserver-timeserver 8888:8888

# Terminal 2 — Prometheus UI
kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090

# Terminal 3 — Grafana UI
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
```

| Service | URL | Credentials |
|---|---|---|
| timeserver | http://localhost:8888 | — |
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3000 | `admin` / `prom-operator` |

#### 4. Verify scraping is working

In Prometheus (`http://localhost:9090`):
- **Status → Service Discovery** — look for `serviceMonitor/default/timeserver-timeserver/0`
- **Status → Targets** — state should be **UP** in green

Generate some traffic so metrics appear:
```bash
for i in {1..20}; do curl -s http://localhost:8888/api/v1/time > /dev/null; done
```

#### 5. Useful PromQL queries

Paste these into the **Graph** tab in Prometheus or into a Grafana visualization:

```
# Total requests by route and status code
http_requests_total

# Request rate per second over the last 5 minutes
rate(http_requests_total[5m])

# 95th percentile response time in milliseconds
histogram_quantile(0.95, rate(http_request_duration_ms_bucket[5m]))

# Error rate (4xx and 5xx responses)
rate(http_requests_total{status_code=~"[45].."}[5m])

# Node.js heap memory usage in bytes
nodejs_heap_size_used_bytes
```

#### 6. Build a Grafana dashboard

1. Open Grafana at `http://localhost:3000` and log in
2. Click **+** → **New Dashboard** → **Add visualization**
3. Select **Prometheus** as the data source
4. Paste any of the queries above and click **Run query**
5. Click **Save dashboard** to persist it

---

## TODO — Enterprise Improvements

Items are ordered by priority. High-priority items should be tackled first as they have the most impact on reliability and debuggability.

### Observability
- [x] **Structured logging** — replace `console.error` with `pino` or `winston` emitting JSON logs with timestamp, level, correlation ID, and request context
- [x] **Request ID propagation** — generate and attach `X-Request-ID` header to every request; include it in all log lines
- [x] **Prometheus metrics** — expose `GET /metrics` endpoint tracking request count, error rate, and response latency
- [x] **Grafana dashboard** — pair with minikube `metrics-server` addon to visualise metrics locally (see [Grafana + Prometheus on Minikube](#grafana--prometheus-on-minikube))
- [x] **Distributed tracing** — add OpenTelemetry (`@opentelemetry/sdk-node`) for end-to-end request tracing

### Resilience
- [x] **Graceful shutdown** — handle `SIGTERM`/`SIGINT` to drain in-flight requests before process exit (prevents dropped requests during rolling deploys)
- [x] **Liveness vs readiness probe separation** — readiness checks dependencies (DB, cache); liveness only checks the process is alive
- [x] **Rate limiting** — add `express-rate-limit` middleware to prevent abuse

### Security
- [x] **Helmet** — add `helmet()` middleware to set 14 security HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- [x] **Input validation** — add `zod` or `joi` to validate and sanitise query params and request bodies at system boundaries
- [x] **Secrets management** — use Kubernetes Secrets or Vault/AWS Secrets Manager; never commit secrets to `values.yaml`
- [x] **Image scanning** — integrate `trivy` or `docker scout` into the build pipeline to scan for CVEs before deploy

### CI/CD Pipeline
- [x] **GitHub Actions workflow** — `lint → test → build → image scan → helm lint → deploy → smoke tests` on every push
- [x] **ESLint** — add `eslint` with `@typescript-eslint` rules
- [x] **Pre-commit hooks** — add `husky` + `lint-staged` to enforce linting and tests before every commit
- [x] **Semantic versioning** — auto-generate image tags from git SHAs (`timeserver:$(git rev-parse --short HEAD)`)

### Kubernetes Hardening
- [x] **ConfigMap** — move `PORT`, `NODE_ENV` out of the Deployment template into a dedicated ConfigMap manifest
- [x] **Horizontal Pod Autoscaler (HPA)** — scale pod count automatically based on CPU/memory (requires `metrics-server` addon)
- [x] **Pod Disruption Budget (PDB)** — guarantee minimum number of pods remain running during node maintenance or rolling deploys
- [x] **Network Policy** — restrict inter-pod traffic to only what is explicitly required
- [x] **Resource quotas per namespace** — cap total CPU/memory consumption to prevent one service starving others

### Developer Experience
- [x] **`docker-compose.yml`** — full local stack (timeserver + Prometheus + Grafana) with a single `docker compose up`
- [x] **`Makefile`** — wrap common command sequences (`make test`, `make build`, `make deploy`, `make compose-up`)
- [x] **OpenAPI docs** — `swagger-jsdoc` + `swagger-ui-express` serving interactive docs at `/api/docs`
- [x] **Docusaurus documentation** — full project docs site at [sp724.github.io/timeserver](https://sp724.github.io/timeserver/) covering API, deployment, observability, CI/CD, Kubernetes, and secrets
