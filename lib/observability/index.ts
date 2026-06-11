/**
 * Observability wrapper (P6 / M6.5).
 *
 * Tiny facade over error capture + product analytics so the rest of the
 * codebase never touches an SDK directly.
 *
 * - trackEvent: live path posts to PostHog's HTTP capture API via fetch
 *   (no SDK dependency) behind services.posthog; demo logs to console.
 * - captureError: demo logs to console. The live Sentry path is wired
 *   through @sentry/nextjs instrumentation when SENTRY_DSN is present
 *   (instrumentation.ts), not from here, because Sentry needs build-time
 *   setup; this facade stays the single call site so adopting it later is
 *   a one-file change.
 */

import { env, services } from "@/lib/env";

export function captureError(err: unknown, ctx?: Record<string, unknown>) {
  if (services.sentry) {
    // Live: Sentry is initialised in instrumentation.ts; capture there or
    // via globalThis Sentry. Kept out of the hot path until a DSN exists.
  }
  if (process.env.NODE_ENV !== "production") {
    console.error("[observability]", err, ctx);
  }
}

/**
 * Funnel/product event. `distinctId` ties the event to a user when known
 * (falls back to "anonymous"). Fire-and-forget: never throws, never
 * blocks the caller on a slow analytics endpoint.
 */
export function trackEvent(
  name: string,
  props?: Record<string, unknown>,
  distinctId?: string
) {
  if (services.posthog) {
    void fetch(`${env.posthogHost}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: env.posthogKey,
        event: name,
        distinct_id: distinctId ?? "anonymous",
        properties: props ?? {},
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Analytics must never break a request.
    });
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[event]", name, props ?? {});
  }
}
