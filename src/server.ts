import express, { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import swaggerUi from "swagger-ui-express";

import { getCurrentTimes } from "./timeService";
import { logger } from "./logger";
import { register, httpRequestsTotal, httpRequestDurationMs } from "./metrics";
import { startTracing, stopTracing } from "./tracing";
import { swaggerSpec } from "./swagger";
import { HealthResponse, ReadinessResponse, TimeResponse, ErrorResponse } from "./types";

startTracing();

export const app = express();

app.use(express.json());

// Structured request logging + request ID.
// Reads X-Request-ID from incoming request if present; generates a UUID otherwise.
// Echoes the ID back on the response so clients can correlate logs.
app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const existing = req.headers["x-request-id"];
      const id = (Array.isArray(existing) ? existing[0] : existing) ?? randomUUID();
      res.setHeader("X-Request-ID", id);
      return id;
    },
  })
);

// Metrics collection — attaches a finish listener to every response.
// req.route.path is set by Express after routing completes, so it is
// available by the time the finish event fires.
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const route = (req.route?.path as string | undefined) ?? "unknown";
    const labels = { method: req.method, route, status_code: String(res.statusCode) };
    httpRequestsTotal.inc(labels);
    httpRequestDurationMs.observe(labels, Date.now() - start);
  });
  next();
});

// Rate limiter — applied to /api/ routes only.
// Health probes and /metrics are intentionally excluded so Kubernetes
// probes and Prometheus scrapers are never rate-limited.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TooManyRequests", message: "Rate limit exceeded, try again later" },
});

app.use("/api/", apiLimiter);

// Prometheus metrics scrape endpoint
app.get("/metrics", async (_req: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Liveness probe — answers: "is the process alive?"
// Kubernetes restarts the pod if this fails.
app.get("/health/live", (_req: Request, res: Response<HealthResponse>) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe — answers: "is the app ready to serve traffic?"
// Kubernetes removes the pod from the load balancer if this fails (no restart).
// Add dependency checks here (DB, cache, etc.) as the app grows.
app.get("/health/ready", (_req: Request, res: Response<ReadinessResponse>) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/v1/time", (_req: Request, res: Response<TimeResponse>) => {
  res.json(getCurrentTimes());
});

// OpenAPI docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 fallback
app.use((_req: Request, res: Response<ErrorResponse>) => {
  res.status(404).json({
    error: "NotFound",
    message: "The requested resource was not found",
  });
});

// Global error handler — exported for unit testing
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({
    error: "InternalServerError",
    message: "An unexpected error occurred",
  });
}

app.use(errorHandler);

const PORT = parseInt(process.env.PORT ?? "8888", 10);

/* istanbul ignore next */
if (require.main === module) {
  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, "timeserver listening");
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, "Shutting down gracefully");
    server.close(async () => {
      await stopTracing();
      logger.info("Server closed");
      process.exit(0);
    });
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
}
