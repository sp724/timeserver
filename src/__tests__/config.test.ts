import { configSchema } from "../config";

describe("configSchema", () => {
  it("applies defaults when no env vars are set", () => {
    const result = configSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.PORT).toBe(8888);
    expect(result.data?.LOG_LEVEL).toBe("info");
    expect(result.data?.OTEL_ENABLED).toBe(false);
  });

  it("coerces PORT from string to number", () => {
    const result = configSchema.safeParse({ PORT: "3000" });
    expect(result.success).toBe(true);
    expect(result.data?.PORT).toBe(3000);
  });

  it("rejects PORT below 1", () => {
    const result = configSchema.safeParse({ PORT: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects PORT above 65535", () => {
    const result = configSchema.safeParse({ PORT: "99999" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid LOG_LEVEL", () => {
    const result = configSchema.safeParse({ LOG_LEVEL: "verbose" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid LOG_LEVEL values", () => {
    for (const level of ["trace", "debug", "info", "warn", "error", "silent"]) {
      const result = configSchema.safeParse({ LOG_LEVEL: level });
      expect(result.success).toBe(true);
    }
  });

  it("transforms OTEL_ENABLED=true to boolean true", () => {
    const result = configSchema.safeParse({ OTEL_ENABLED: "true" });
    expect(result.success).toBe(true);
    expect(result.data?.OTEL_ENABLED).toBe(true);
  });

  it("transforms OTEL_ENABLED=false to boolean false", () => {
    const result = configSchema.safeParse({ OTEL_ENABLED: "false" });
    expect(result.success).toBe(true);
    expect(result.data?.OTEL_ENABLED).toBe(false);
  });

  it("accepts an optional OTEL_EXPORTER_OTLP_ENDPOINT", () => {
    const result = configSchema.safeParse({ OTEL_EXPORTER_OTLP_ENDPOINT: "http://jaeger:4318" });
    expect(result.success).toBe(true);
    expect(result.data?.OTEL_EXPORTER_OTLP_ENDPOINT).toBe("http://jaeger:4318");
  });

  it("accepts any string for NODE_ENV", () => {
    for (const env of ["development", "production", "test", "staging"]) {
      const result = configSchema.safeParse({ NODE_ENV: env });
      expect(result.success).toBe(true);
      expect(result.data?.NODE_ENV).toBe(env);
    }
  });

  it("leaves NODE_ENV undefined when not set", () => {
    const result = configSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.NODE_ENV).toBeUndefined();
  });
});
