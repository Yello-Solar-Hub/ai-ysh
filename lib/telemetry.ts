import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
// eslint-disable-next-line import/no-unresolved
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

let initialized = false;

export function initTelemetry() {
  if (initialized) return;
  initialized = true;

  const exporter = process.env.NEXT_PUBLIC_OTEL_EXPORTER_URL
    ? new OTLPTraceExporter({ url: process.env.NEXT_PUBLIC_OTEL_EXPORTER_URL })
    : new ConsoleSpanExporter();

  const provider = new WebTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  });
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation(),
      new UserInteractionInstrumentation(),
    ],
  });
}
