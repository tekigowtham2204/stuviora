/**
 * Email sender (P5 / Resend).
 *
 * Live path (services.resend): POST to the Resend REST API with fetch.
 * We use the REST endpoint rather than the SDK to avoid adding a runtime
 * dependency; the payload shape is identical.
 *
 * Demo path: log and return a synthetic id so the whole retention loop
 * is exercisable end to end without a key. Never throws on the demo
 * path; in live mode a failed send returns ok:false (callers decide
 * whether to retry) rather than crashing a worker.
 *
 * This mirrors the demo/live branch pattern in lib/ai/quality-gate.ts.
 */

import "server-only";
import { env, services } from "@/lib/env";
import type { EmailMessage } from "@/lib/email/templates";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
  /** True when the demo path handled it (no real delivery). */
  demo?: boolean;
}

export async function sendEmail(
  to: string,
  message: EmailMessage
): Promise<SendResult> {
  if (!services.resend) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[email:demo] to=${to} subject="${message.subject}"`);
    }
    return { ok: true, id: `demo-${Date.now()}`, demo: true };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.resendFrom,
        to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    if (!res.ok) {
      const error = await res.text().catch(() => `HTTP ${res.status}`);
      return { ok: false, error };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: json.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}
