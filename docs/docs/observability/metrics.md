---
sidebar_position: 2
---

# Metrics

timeserver exposes Prometheus metrics at `/metrics` using the [prom-client](https://github.com/siimon/prom-client) library.

## Scraping

```bash
curl http://localhost:8888/metrics
```

The endpoint returns metrics in Prometheus text exposition format.

## Default metrics

`prom-client` collects default Node.js process metrics automatically:

| Metric | Description |
|---|---|
| `process_cpu_user_seconds_total` | CPU time in user mode |
| `process_cpu_system_seconds_total` | CPU time in kernel mode |
| `process_resident_memory_bytes` | RSS memory usage |
| `nodejs_heap_size_used_bytes` | V8 heap used |
| `nodejs_eventloop_lag_seconds` | Event loop lag |
| `nodejs_active_handles_total` | Open handles |

## HTTP metrics

Custom HTTP duration histogram tracking all requests:

```
http_request_duration_seconds_bucket{le="0.05",route="/api/v1/time",method="GET",status_code="200"} 12
http_request_duration_seconds_bucket{le="0.1",...} 42
http_request_duration_seconds_sum{...} 1.234
http_request_duration_seconds_count{...} 42
```

Labels: `route`, `method`, `status_code`.

## Grafana dashboard

A pre-built Grafana dashboard JSON is included at `grafana/dashboard.json`. Import it into any Grafana instance connected to your Prometheus datasource to visualize:

- Request rate (req/s)
- P50 / P95 / P99 latency
- Error rate (4xx / 5xx)
- Node.js heap and event loop lag

## Prometheus scrape config

Add this to your `prometheus.yml` to scrape the server:

```yaml
scrape_configs:
  - job_name: timeserver
    static_configs:
      - targets: ['localhost:8888']
```

When running in Kubernetes, use the pod annotations approach or a `ServiceMonitor` (Prometheus Operator).
