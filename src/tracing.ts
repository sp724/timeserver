import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { logger } from "./logger";

let sdk: NodeSDK | undefined;

// Tracing is opt-in — set OTEL_ENABLED=true to activate.
// In production, replace ConsoleSpanExporter with an OTLP exporter
// pointed at Jaeger, Tempo, or a managed tracing backend.
export function startTracing(): void {
  if (process.env.OTEL_ENABLED !== "true") return;

  /* istanbul ignore next */
  sdk = new NodeSDK({
    traceExporter: new ConsoleSpanExporter(),
  });

  /* istanbul ignore next */
  sdk.start();
  /* istanbul ignore next */
  logger.info("OpenTelemetry tracing started (console exporter — swap for OTLP in production)");
}

export async function stopTracing(): Promise<void> {
  /* istanbul ignore next */
  await sdk?.shutdown();
}
