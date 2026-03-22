import { z } from "zod";

export const configSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8888),
  NODE_ENV: z.string().optional(),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "silent"])
    .default("info"),
  OTEL_ENABLED: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
});

function parseConfig() {
  const result = configSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid configuration:\n${issues}`);
  }
  return result.data;
}

export const config = parseConfig();
