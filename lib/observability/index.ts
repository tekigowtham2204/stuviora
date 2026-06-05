/**
 * Observability wrapper (M6.5).
 *
 * Tiny façade over Sentry + PostHog so the rest of the codebase doesn't
 * touch SDKs directly. Demo path logs to console. Live path: import +
 * call the SDKs behind their service flags.
 */

import { services } from "@/lib/env";

export function captureError(err: unknown, ctx?: Record<string, unknown>) {
  if (services.sentry) {
    // Live (TODO):
    //   import * as Sentry from "@sentry/nextjs";
    //   Sentry.captureException(err, { extra: ctx });
  }
  if (process.env.NODE_ENV !== "production") {
    console.error("[observability]", err, ctx);
  }
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
  if (services.posthog) {
    // Live (TODO):
    //   import posthog from "posthog-node";
    //   posthog.capture({ event: name, properties: props });
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[event]", name, props ?? {});
  }
}
