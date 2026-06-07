import "server-only";
import { Inngest } from "inngest";
import { env, services } from "@/lib/env";

/**
 * Inngest client (P4 / P6).
 *
 * Singleton instance for the application. Used by Server Actions
 * firing events (jobs posted, orders submitted, etc.) and the
 * /api/inngest registration endpoint.
 *
 * In demo mode (no INNGEST_EVENT_KEY) `inngest()` returns null. Callers
 * skip the fire-and-forget send in that case; the in-process worker
 * code paths in inngest/functions.ts still work synchronously where
 * the demo flow needs them (e.g. order submit calls runQualityGate
 * inline).
 */

let _client: Inngest | null = null;

export function inngest(): Inngest | null {
  if (!services.inngest) return null;
  if (_client) return _client;
  _client = new Inngest({
    id: "stuviora",
    eventKey: env.inngestEventKey,
  });
  return _client;
}

/**
 * Event names that the rest of the app fires.
 *
 * Keeping these centralized prevents typo drift between the sender
 * and the receiver in inngest/functions.ts.
 */
export const EVENTS = {
  AI_QUALITY_CHECK: "ai/quality.check",
  TRUST_RECALC: "trust/recalc",
  PORTFOLIO_GENERATE: "portfolio/generate",
  MATCHING_NOTIFY: "matching/notify",
  DISPUTE_ESCALATE: "dispute/escalate",
  TAX_LOG: "tax/log",
  EMAIL_SEND: "email/send",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/**
 * Fire-and-forget event send. Silently no-ops when Inngest is not
 * configured so demo callers do not have to branch.
 */
export async function fireEvent(
  name: EventName,
  data: Record<string, unknown>
): Promise<void> {
  const client = inngest();
  if (!client) return;
  await client.send({ name, data });
}
