---
sidebar_position: 1
---

# Endpoints

The server listens on port `8888` by default. All API endpoints are under `/api/v1`.

Interactive docs are available at `/api/docs` when running locally (not in production).

## GET /api/v1/time

Returns the current time in up to 5 timezones.

### Query parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `cities` | `string` | No | Comma-separated list of cities to include. Valid values: `toronto`, `london`, `mumbai`, `tokyo`, `sydney`. Defaults to all 5. |

### Example — all cities

```bash
curl http://localhost:8888/api/v1/time
```

```json
{
  "toronto": "2024-11-15T10:30:00.000-05:00",
  "london": "2024-11-15T15:30:00.000Z",
  "mumbai": "2024-11-15T21:00:00.000+05:30",
  "tokyo": "2024-11-16T00:30:00.000+09:00",
  "sydney": "2024-11-16T02:30:00.000+11:00"
}
```

### Example — filtered cities

```bash
curl "http://localhost:8888/api/v1/time?cities=toronto,sydney"
```

```json
{
  "toronto": "2024-11-15T10:30:00.000-05:00",
  "sydney": "2024-11-16T02:30:00.000+11:00"
}
```

### Error response — invalid city

```bash
curl "http://localhost:8888/api/v1/time?cities=toronto,paris"
```

```json
{
  "error": "Invalid cities: paris. Valid options: toronto, london, mumbai, tokyo, sydney"
}
```

HTTP status: `400`

---

## GET /health/live

Liveness probe — confirms the process is running.

```bash
curl http://localhost:8888/health/live
```

```json
{ "status": "ok" }
```

---

## GET /health/ready

Readiness probe — confirms the server is ready to accept traffic.

```bash
curl http://localhost:8888/health/ready
```

```json
{ "status": "ok" }
```

---

## GET /metrics

Prometheus metrics endpoint. Returns text in Prometheus exposition format.

```bash
curl http://localhost:8888/metrics
```

```
# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 0.123456
...
http_request_duration_seconds_bucket{le="0.1",route="/api/v1/time",method="GET",status_code="200"} 42
```

---

## Rate limiting

All `/api/v1/` routes are rate-limited to **100 requests per 15 minutes** per IP. Exceeding this returns HTTP `429 Too Many Requests`.

---

## OpenAPI / Swagger UI

When `NODE_ENV` is not `production`, the full OpenAPI spec is available at:

```
http://localhost:8888/api/docs
```
