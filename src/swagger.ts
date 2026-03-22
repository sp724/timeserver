import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "timeserver",
      version: "1.0.0",
      description: "REST API returning current time in Toronto, London, Mumbai, and Tokyo.",
    },
    paths: {
      "/health/live": {
        get: {
          summary: "Liveness probe",
          description: "Returns process uptime and status. Kubernetes restarts the pod if this fails.",
          tags: ["Health"],
          responses: {
            "200": {
              description: "Process is alive",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      uptime: { type: "number", example: 42.3 },
                      timestamp: { type: "string", format: "date-time", example: "2026-03-21T02:00:00.000Z" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/health/ready": {
        get: {
          summary: "Readiness probe",
          description: "Returns readiness status. Kubernetes removes the pod from the load balancer if this fails.",
          tags: ["Health"],
          responses: {
            "200": {
              description: "App is ready to serve traffic",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      timestamp: { type: "string", format: "date-time", example: "2026-03-21T02:00:00.000Z" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/metrics": {
        get: {
          summary: "Prometheus metrics",
          description: "Exposes http_requests_total, http_request_duration_ms, and Node.js process metrics in Prometheus text format.",
          tags: ["Observability"],
          responses: {
            "200": {
              description: "Prometheus text format metrics",
              content: {
                "text/plain": {
                  schema: { type: "string" },
                },
              },
            },
          },
        },
      },
      "/api/v1/time": {
        get: {
          summary: "Current time in 4 timezones",
          description: "Returns the current time in Toronto, London, Mumbai, and Tokyo. Rate limited to 100 requests per minute per IP.",
          tags: ["Time"],
          responses: {
            "200": {
              description: "Current time in all 4 timezones",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      toronto: { type: "string", example: "2026-03-20, 22:00:00" },
                      london: { type: "string", example: "2026-03-21, 02:00:00" },
                      mumbai: { type: "string", example: "2026-03-21, 07:30:00" },
                      tokyo: { type: "string", example: "2026-03-21, 11:00:00" },
                      generatedAt: { type: "string", format: "date-time", example: "2026-03-21T02:00:00.000Z" },
                    },
                  },
                },
              },
            },
            "429": {
              description: "Rate limit exceeded",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: { type: "string", example: "TooManyRequests" },
                      message: { type: "string", example: "Rate limit exceeded, try again later" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
