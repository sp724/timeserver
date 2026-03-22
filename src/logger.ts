import pino from "pino";

// Use silent level in tests to suppress log output.
// Override with LOG_LEVEL env var in any environment.
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "test" ? "silent" : "info"),
  base: { service: "timeserver" },
});
