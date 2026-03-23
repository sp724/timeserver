---
sidebar_position: 3
---

# Tracing

timeserver supports distributed tracing via [OpenTelemetry](https://opentelemetry.io). Traces can be exported to any OTLP-compatible backend (Jaeger, Tempo, Honeycomb, etc.).

## Configuration

| Environment variable | Default | Description |
|---|---|---|
| `OTEL_ENABLED` | `false` | Set to `true` to enable tracing |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | — | OTLP collector endpoint (e.g. `http://localhost:4318`) |

## Enable tracing locally

```bash
OTEL_ENABLED=true \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
npm run dev
```

## Running Jaeger locally

Jaeger ships an all-in-one image that accepts OTLP and hosts a UI:

```bash
docker run -d --name jaeger \
  -p 4318:4318 \
  -p 16686:16686 \
  jaegertracing/all-in-one:latest
```

Then open `http://localhost:16686` to view traces.

## What gets traced

- Every incoming HTTP request — span includes method, route, status code
- Downstream calls (if any are added) — automatically instrumented via `@opentelemetry/auto-instrumentations-node`

## Kubernetes

Pass the env vars via the Helm secret or ConfigMap:

```yaml
# values.secret.yaml
secret:
  create: true
  data:
    OTEL_ENABLED: "true"
    OTEL_EXPORTER_OTLP_ENDPOINT: "http://otel-collector:4318"
```
