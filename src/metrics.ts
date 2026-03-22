import { Registry, Counter, Histogram, collectDefaultMetrics } from "prom-client";

// Isolated registry — avoids conflicts with any other prom-client usage
export const register = new Registry();
register.setDefaultLabels({ service: "timeserver" });

// Collects Node.js process metrics: CPU, memory, event loop lag, GC, etc.
collectDefaultMetrics({ register });

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [register],
});

export const httpRequestDurationMs = new Histogram({
  name: "http_request_duration_ms",
  help: "HTTP request duration in milliseconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
  registers: [register],
});
