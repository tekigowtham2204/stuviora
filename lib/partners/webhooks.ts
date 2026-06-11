import "server-only";
import { randomBytes } from "node:crypto";
import { signRequest } from "@/lib/partners/hmac";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";

/**
 * Outbound partner webhooks (features.md: milestone deliveries).
 *
 * Fires HMAC-signed POSTs to a partner's registered endpoint for cohort
 * milestones (student.completed_first_job, student.tier_upgraded). The
 * signature uses the same canonical scheme as inbound requests
 * (lib/partners/hmac.ts), so a partner verifies both directions with one
 * secret. Demo: logs the intended delivery and returns.
 */

export type PartnerEvent =
  | "student.completed_first_job"
  | "student.tier_upgraded";

export interface PartnerDelivery {
  ok: boolean;
  demo?: boolean;
  status?: number;
}

export async function dispatchPartnerWebhook(
  event: PartnerEvent,
  college: string,
  payload: Record<string, unknown>
): Promise<PartnerDelivery> {
  if (!services.supabase) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[partner-webhook:demo] ${event} -> ${college}`, payload);
    }
    return { ok: true, demo: true };
  }

  const supabase = getServiceSupabase();
  if (!supabase) return { ok: false };

  const { data: partner } = await supabase
    .from("university_partners")
    .select("key_id, secret, webhook_url")
    .eq("college", college)
    .eq("active", true)
    .maybeSingle<{ key_id: string; secret: string; webhook_url: string | null }>();
  if (!partner?.webhook_url) return { ok: true }; // nothing registered

  const body = JSON.stringify({ event, college, payload, sentAt: Date.now() });
  const timestamp = String(Date.now());
  const nonce = randomBytes(8).toString("hex");
  const path = new URL(partner.webhook_url).pathname;
  const signature = signRequest({
    secret: partner.secret,
    method: "POST",
    path,
    timestamp,
    nonce,
    body,
  });

  try {
    const res = await fetch(partner.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": partner.key_id,
        "X-Stuviora-Timestamp": timestamp,
        "X-Stuviora-Nonce": nonce,
        "X-Stuviora-Signature": signature,
      },
      body,
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false };
  }
}
