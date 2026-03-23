---
sidebar_position: 1
---

# Logging

timeserver uses [pino](https://getpino.io) for structured JSON logging. Every log line is a JSON object, which makes logs easy to query in tools like Grafana Loki, Datadog, or CloudWatch.

## Log levels

Controlled by the `LOG_LEVEL` environment variable. Valid values (in order of verbosity):

| Level | When to use |
|---|---|
| `trace` | Very detailed internal flow |
| `debug` | Development diagnostics |
| `info` | Normal operational events (default) |
| `warn` | Unexpected but recoverable situations |
| `error` | Errors that need attention |
| `silent` | Suppress all output |

```bash
LOG_LEVEL=debug npm run dev
```

## Log format

Each line is a JSON object written to stdout. Example request log:

```json
{
  "level": 30,
  "time": 1731678600000,
  "pid": 12345,
  "hostname": "timeserver-abc12",
  "msg": "request completed",
  "req": {
    "method": "GET",
    "url": "/api/v1/time",
    "remoteAddress": "127.0.0.1"
  },
  "res": {
    "statusCode": 200
  },
  "responseTime": 3.5
}
```

## pino-http

HTTP request/response logging is handled by `pino-http`, which automatically logs every incoming request and its response status and duration.

## No `console.log`

ESLint is configured with `no-console: error` — all logging must go through the pino logger. This prevents unstructured output from leaking into production logs.
