import { NextResponse, type NextRequest } from "next/server";
import {
  guardWebhookIdempotency,
  releaseEscrow,
} from "@/lib/razorpay/escrow";
import { env, services } from "@/lib/env";
import { getServiceSupabase } from "@/lib/supabase/server";

/**
 * Razorpay webhook handler (P3).
 *
 * Live security checklist (master plan section 3.1):
 *  1. HMAC-SHA256 verify with the webhook secret.
 *  2. Idempotency guard via webhook_events table.
 *  3. Dispatch by event type and persist ledger rows + dispatch
 *     downstream events (Inngest portfolio + trust recalc).
 *  4. Always return 200 once the event is recorded, so Razorpay does
 *     not retry. Failures are surfaced via Sentry (P6) once that lands.
 *
 * Demo path: accept any signature when no secret is configured, no
 * DB writes, log + ack. The dispatch switch still runs so flows
 * exercise the right branches.
 */

export const dynamic = "force-dynamic";

async function verifySignature(rawBody: string, signature: string | null) {
  if (!env.razorpayWebhookSecret) return true; // demo
  if (!signature) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(env.razorpayWebhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  // Constant-time compare so a forged signature cannot be brute-forced
  // by timing the response. Runtime-agnostic (no Node Buffer needed).
  return timingSafeEqualStr(expected, signature);
}

/** Length-checked, constant-time string comparison. */
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

interface RazorpayWebhookEvent {
  event?: string;
  id?: string;
  payload?: {
    payment?: { entity?: { order_id?: string; id?: string; amount?: number; notes?: Record<string, string> } };
    transfer?: { entity?: { id?: string; source?: string; amount?: number; notes?: Record<string, string> } };
    refund?: { entity?: { id?: string; payment_id?: string; amount?: number } };
  };
}

function studierOrderIdFromEvent(event: RazorpayWebhookEvent): string | null {
  return (
    event.payload?.payment?.entity?.notes?.order_id ??
    event.payload?.transfer?.entity?.notes?.order_id ??
    null
  );
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  const valid = await verifySignature(rawBody, signature);
  if (!valid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  // Idempotency
  if (event.id) {
    const fresh = await guardWebhookIdempotency(event.id);
    if (!fresh) return NextResponse.json({ ok: true, duplicate: true });
  }

  const orderId = studierOrderIdFromEvent(event);
  const supabase = services.supabase ? getServiceSupabase() : null;

  switch (event.event) {
    case "payment.authorized": {
      // Pay-on-delivery: the client authorized a HOLD (no charge yet). Record
      // the authorization and let work begin. The actual charge happens later,
      // when the AI gate passes the work (capturePayment -> payment.captured).
      if (supabase && orderId) {
        await supabase
          .from("orders")
          .update({ status: "active" })
          .eq("id", orderId);
        await supabase
          .from("payments")
          .upsert(
            {
              order_id: orderId,
              razorpay_payment_id: event.payload?.payment?.entity?.id ?? null,
              status: "authorized",
              amount: (event.payload?.payment?.entity?.amount ?? 0) / 100,
            },
            { onConflict: "order_id" }
          );
      }
      break;
    }

    case "payment.captured": {
      // P9.1 featured-listing purchase: a one-shot captured payment whose
      // notes carry featured_days + featured_job_id promotes the job.
      const notes = event.payload?.payment?.entity?.notes;
      const featuredDays = Number(notes?.featured_days ?? 0);
      const featuredJobId = notes?.featured_job_id;
      if (supabase && featuredDays > 0 && featuredJobId) {
        await supabase
          .from("jobs")
          .update({
            featured_until: new Date(
              Date.now() + featuredDays * 86400_000
            ).toISOString(),
          })
          .eq("id", featuredJobId);
      }

      // Order capture: this fires when we capture the held authorization on an
      // AI-gate PASS. The order status is already set by submitWork; here we
      // only record that the client has now been charged.
      if (supabase && orderId) {
        await supabase
          .from("payments")
          .upsert(
            {
              order_id: orderId,
              razorpay_payment_id: event.payload?.payment?.entity?.id ?? null,
              status: "captured",
              amount:
                (event.payload?.payment?.entity?.amount ?? 0) / 100,
              captured_at: new Date().toISOString(),
            },
            { onConflict: "order_id" }
          );
      }
      break;
    }

    case "transfer.settled": {
      // The Route transfer settled to the student linked account.
      // Mark the commission_event as settled + tag the order completed
      // if everything for this order has landed.
      const transferId = event.payload?.transfer?.entity?.id;
      if (supabase && orderId) {
        await supabase
          .from("transfer_log")
          .update({ status: "settled", settled_at: new Date().toISOString() })
          .eq("razorpay_transfer_id", transferId);
        await supabase
          .from("commission_events")
          .update({ status: "settled" })
          .eq("order_id", orderId);
        // Fire downstream Inngest events (P5 + P6 wire the workers).
      }
      break;
    }

    case "refund.created": {
      // Reverse the commission_event; mark the order refunded.
      if (supabase && orderId) {
        await supabase
          .from("commission_events")
          .update({ status: "reversed" })
          .eq("order_id", orderId);
        await supabase
          .from("orders")
          .update({ status: "refunded" })
          .eq("id", orderId);
      }
      break;
    }

    case "payment.failed": {
      if (supabase && orderId) {
        await supabase
          .from("orders")
          .update({ status: "cancelled" })
          .eq("id", orderId);
      }
      break;
    }

    default:
      // Unknown events are acked but recorded (the webhook_events
      // insert above already happened).
      break;
  }

  return NextResponse.json({ ok: true });
}

/** Internal helper exposed for /demo / admin scripts; not part of the public API. */
export async function _demoRelease(orderId: string, amount: number) {
  return releaseEscrow({ orderId, amount });
}
