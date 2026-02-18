/**
 * OpenTelemetry Helper Functions for Distributed Tracing
 *
 * IMPORTANT: You do NOT need to install separate OpenTelemetry packages!
 *
 * Grafana Faro's TracingInstrumentation already includes:
 * - All OpenTelemetry packages (@opentelemetry/sdk-trace-web, etc.)
 * - Automatic fetch/XHR instrumentation
 * - Trace context propagation (traceparent headers)
 * - Integration with Grafana Cloud OTLP endpoint
 *
 * How it works with your Azure Functions backend:
 * 1. User makes API call from frontend
 * 2. Faro creates a trace span (trace_id: abc123)
 * 3. Faro automatically adds header: traceparent: 00-abc123-span001-01
 * 4. Your Azure Function (with OpenTelemetry) reads traceparent
 * 5. Backend continues the trace with same trace_id
 * 6. Both frontend and backend spans appear in Grafana with same trace_id
 *
 * This module provides helper functions for CUSTOM instrumentation only.
 * Most apps won't need these - Faro handles everything automatically.
 */

import { trace } from '@opentelemetry/api';
import { config } from '../config/app.config';

/**
 * Initialize OpenTelemetry tracing
 *
 * Note: This is a no-op function since Grafana Faro handles everything.
 * Kept for backwards compatibility and future custom instrumentation needs.
 */
export function initializeOpenTelemetry() {
  // Faro's TracingInstrumentation handles all tracing automatically:
  // - Instruments fetch() and XMLHttpRequest
  // - Propagates trace context via traceparent headers
  // - Sends traces to Grafana Cloud OTLP endpoint
  // - Compatible with Azure Functions OpenTelemetry SDK

  if (config.isDevelopment) {
    console.log('OpenTelemetry: Grafana Faro handles all distributed tracing automatically');
  }
}

/**
 * Create a custom span for manual instrumentation
 *
 * Use this for tracing user interactions or custom operations
 * that aren't automatically instrumented.
 *
 * @example
 * ```typescript
 * const span = startSpan('user_checkout', { userId: user.id });
 * try {
 *   await processCheckout();
 *   span.setStatus({ code: SpanStatusCode.OK });
 * } catch (error) {
 *   span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
 * } finally {
 *   span.end();
 * }
 * ```
 */
export function startSpan(name: string, attributes?: Record<string, string | number | boolean>) {
  const tracer = trace.getTracer(`${config.appName}-frontend`, '1.0.0');
  const span = tracer.startSpan(name, {
    attributes,
  });
  return span;
}

/**
 * Get the current trace context
 * Useful for logging correlation
 */
export function getCurrentTraceContext() {
  const span = trace.getActiveSpan();
  if (!span) return null;

  const spanContext = span.spanContext();
  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
    traceFlags: spanContext.traceFlags,
  };
}

/**
 * Cleanup OpenTelemetry (call on app shutdown)
 * Note: With Faro tracing, cleanup is handled by Faro itself
 */
export function shutdownOpenTelemetry() {
  console.log('OpenTelemetry cleanup handled by Grafana Faro');
}
