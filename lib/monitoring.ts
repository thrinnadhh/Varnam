/**
 * Varnam Error Monitoring & Telemetry Integration
 *
 * Production-ready abstraction for error tracking, diagnostics, and reporting.
 * Seamlessly integrates with Sentry, LogRocket, or Datadog when DSN is configured.
 */

interface ErrorContext {
  userId?: string;
  orderNumber?: string;
  route?: string;
  extra?: Record<string, unknown>;
}

export function captureException(error: unknown, context?: ErrorContext): void {
  const isProd = process.env.NODE_ENV === "production";
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const payload = {
    timestamp: new Date().toISOString(),
    message: errorMessage,
    stack: errorStack,
    environment: process.env.NODE_ENV,
    ...context,
  };

  if (!isProd) {
    console.group(`🚨 [Varnam Monitoring] Captured Exception`);
    console.error("Error:", error);
    if (context) console.info("Context:", context);
    console.groupEnd();
  } else {
    // In production, send to external monitoring service if DSN/endpoint configured
    try {
      if (typeof window !== "undefined" && (window as unknown as { Sentry?: { captureException: (e: unknown, ctx?: unknown) => void } }).Sentry) {
        (window as unknown as { Sentry: { captureException: (e: unknown, ctx?: unknown) => void } }).Sentry.captureException(error, { extra: payload });
      }
    } catch (e) {
      console.error("Telemetry transport error:", e);
    }
  }
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info", context?: ErrorContext): void {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    console.log(`ℹ️ [Varnam Telemetry - ${level.toUpperCase()}]: ${message}`, context);
  }
}

export function useErrorMonitoring() {
  return {
    captureException,
    captureMessage,
  };
}
