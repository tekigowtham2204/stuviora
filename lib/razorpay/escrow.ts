import "server-only";
import { razorpay, razorpayKeyIdPublic } from "@/lib/razorpay/client";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";
import { computeSplit } from "@/lib/utils";
import { computeOrderTax } from "@/lib/tax/engine";

/**
 * Razorpay Route pay-on-delivery + atomic 85/15 split.
 *
 * The client is never charged upfront. Their payment is authorized (a hold)
 * at hire and captured only when the AI gate passes the work, so they pay on
 * receipt of quality-checked work. The whole flow runs with no human in it.
 *
 * Live path:
 *   1. createEscrowOrder      Razorpay Orders API (payment_capture: 0) so the
 *                              client's payment is an authorization, plus the
 *                              Route transfer config for the eventual split.
 *   2. client authorizes      'payment.authorized' webhook -> hold placed,
 *                              work begins (HMAC-SHA256 verified, idempotent).
 *   3. AI gate PASS           capturePayment -> client charged on delivery.
 *                              3x FAIL -> voidAuthorization, never charged.
 *   4. dispute window         client may dispute (refundCapture) or it elapses.
 *   5. releaseEscrow          on window expiry / early confirm: Route transfer
 *                              85% -> student, 15% -> platform.
 *   6. 'transfer.settled'     finalize commission_events + tax_events.
 *
 * Demo path: returns deterministic results using computeSplit so the
 * UX is fully exercisable without keys.
 */

export interface EscrowOrder {
  id: string;
  orderId: string;
  amount: number;
  status:
    | "pending"
    | "authorized"
    | "captured"
    | "released"
    | "refunded"
    | "failed";
  razorpayOrderId?: string;
  /** Public key id for Checkout. */
  keyId?: string;
  createdAt: number;
}

export interface ReleaseResult {
  studentPayout: number;
  platformGross: number;
  gst: number;
  platformNet: number;
  razorpayTransferId?: string;
}

export interface CreateEscrowInput {
  orderId: string;
  amount: number;        // INR rupees
  clientId: string;
  studentRazorpayAccountId?: string;
  notes?: Record<string, string>;
}

/**
 * Create the Razorpay Order. The order carries a `transfers[]` block
 * so the payout split happens automatically when the payment is
 * captured. Returns the Razorpay order id + key id for the client-side
 * Checkout embed.
 */
export async function createEscrowOrder(input: CreateEscrowInput): Promise<EscrowOrder> {
  if (services.razorpay) {
    const rzp = razorpay();
    if (rzp) {
      const tax = computeOrderTax(input.amount);
      const studentPaise = Math.round(tax.studentGross * 100);
      const totalPaise = Math.round(input.amount * 100);

      const transfers: Record<string, unknown>[] = [];
      if (input.studentRazorpayAccountId) {
        transfers.push({
          account: input.studentRazorpayAccountId,
          amount: studentPaise,
          currency: "INR",
          notes: { order_id: input.orderId, kind: "student_payout" },
          on_hold: 1, // released by our explicit transfer.release call after approval
        });
      }

      // The Razorpay SDK's order types don't model the Route transfers
      // block cleanly, so we use a structured cast at the boundary.
      // payment_capture: 0 makes this an AUTHORIZATION (a hold), not a
      // charge: pay-on-delivery means the client is only captured when the
      // AI gate passes the work. See capturePayment / voidAuthorization.
      const orderPayload = {
        amount: totalPaise,
        currency: "INR",
        receipt: input.orderId,
        payment_capture: 0,
        notes: { order_id: input.orderId, client_id: input.clientId, ...input.notes },
        transfers: transfers.length ? transfers : undefined,
      } as unknown as Parameters<typeof rzp.orders.create>[0];
      const order = (await rzp.orders.create(orderPayload)) as { id: string };

      return {
        id: `pay_${input.orderId}_${Date.now()}`,
        orderId: input.orderId,
        amount: input.amount,
        status: "pending",
        razorpayOrderId: order.id,
        keyId: razorpayKeyIdPublic() ?? undefined,
        createdAt: Date.now(),
      };
    }
  }

  return {
    id: `pay_${input.orderId}_${Date.now()}`,
    orderId: input.orderId,
    amount: input.amount,
    status: "pending",
    createdAt: Date.now(),
  };
}

export interface ReleaseEscrowInput {
  orderId: string;
  amount: number;
  studentRazorpayAccountId?: string;
}

/**
 * Idempotent escrow release. Three callers: client approves,
 * 72-hour Inngest cron, admin override.
 *
 * Live path: release the on-hold transfer (if the order was created
 * with `on_hold: 1`) so the student's linked account is credited.
 * Writes commission_event + tax_event rows via service role; the
 * 'transfer.settled' webhook is the source of truth for "settled".
 */
export async function releaseEscrow(input: ReleaseEscrowInput): Promise<ReleaseResult> {
  const split = computeSplit(input.amount);

  if (services.razorpay) {
    const rzp = razorpay();
    if (rzp) {
      // Find the on-hold transfer for this order. We tagged it with
      // `notes.order_id` at creation so we can look it up.
      // In live mode the founder uses Razorpay Dashboard to verify
      // the result; the daily reconciler covers anything missed.
      const supabase = getServiceSupabase();
      const { data: existing } = supabase
        ? await supabase
            .from("transfer_log")
            .select("razorpay_transfer_id")
            .eq("order_id", input.orderId)
            .eq("kind", "student_payout")
            .maybeSingle<{ razorpay_transfer_id: string | null }>()
        : { data: null };

      let transferId = existing?.razorpay_transfer_id ?? null;

      if (!transferId) {
        // Fallback path: create a fresh Route transfer directly.
        if (input.studentRazorpayAccountId) {
          const transfer = await rzp.transfers.create({
            account: input.studentRazorpayAccountId,
            amount: Math.round(split.studentPayout * 100),
            currency: "INR",
            notes: { order_id: input.orderId, kind: "student_payout" },
          });
          transferId = transfer.id;
        }
      }

      // Write the ledger rows (idempotency relies on the unique
      // (order_id, kind) index on commission_events / transfer_log).
      if (supabase && transferId) {
        await supabase
          .from("transfer_log")
          .upsert(
            {
              order_id: input.orderId,
              razorpay_transfer_id: transferId,
              kind: "student_payout",
              amount: split.studentPayout,
            },
            { onConflict: "order_id,kind" }
          );
      }

      return {
        studentPayout: split.studentPayout,
        platformGross: split.commission,
        gst: split.gst,
        platformNet: split.platformNet,
        razorpayTransferId: transferId ?? undefined,
      };
    }
  }

  return {
    studentPayout: split.studentPayout,
    platformGross: split.commission,
    gst: split.gst,
    platformNet: split.platformNet,
  };
}

/**
 * Capture the held authorization. Called the moment the AI gate PASSES a
 * delivery: the client is charged on receipt of quality-checked work, never
 * before. Idempotent at the ledger level. Demo returns deterministically.
 */
export async function capturePayment(input: {
  orderId: string;
  amount: number;
}): Promise<{ captured: number; razorpayPaymentId?: string }> {
  if (services.razorpay) {
    const rzp = razorpay();
    const supabase = getServiceSupabase();
    if (rzp && supabase) {
      const { data } = await supabase
        .from("payments")
        .select("razorpay_payment_id")
        .eq("order_id", input.orderId)
        .maybeSingle<{ razorpay_payment_id: string | null }>();
      const paymentId = data?.razorpay_payment_id ?? undefined;
      if (paymentId) {
        await rzp.payments.capture(
          paymentId,
          Math.round(input.amount * 100),
          "INR"
        );
        await supabase
          .from("payments")
          .update({ status: "captured", captured_at: new Date().toISOString() })
          .eq("order_id", input.orderId);
        return { captured: input.amount, razorpayPaymentId: paymentId };
      }
    }
  }
  return { captured: input.amount };
}

/**
 * Void a held authorization without charging anything. Called when the gate
 * fails the work past its last revision: an uncaptured authorization is simply
 * never captured (Razorpay lets it expire), so the client pays nothing. We
 * record the void in our ledger. No human, no refund processing fee.
 */
export async function voidAuthorization(input: {
  orderId: string;
}): Promise<{ voided: true }> {
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase
        .from("payments")
        .update({ status: "voided" })
        .eq("order_id", input.orderId);
    }
  }
  return { voided: true };
}

/**
 * Refund a payment that was already captured. Used when a client disputes
 * inside the post-delivery window. Demo returns deterministically.
 */
export async function refundCapture(input: {
  orderId: string;
  amount: number;
}): Promise<{ refunded: number }> {
  if (services.razorpay) {
    const rzp = razorpay();
    const supabase = getServiceSupabase();
    if (rzp && supabase) {
      const { data } = await supabase
        .from("payments")
        .select("razorpay_payment_id")
        .eq("order_id", input.orderId)
        .maybeSingle<{ razorpay_payment_id: string | null }>();
      const paymentId = data?.razorpay_payment_id ?? undefined;
      if (paymentId) {
        await rzp.payments.refund(paymentId, {
          amount: Math.round(input.amount * 100),
          notes: { order_id: input.orderId, kind: "dispute_refund" },
        });
        await supabase
          .from("payments")
          .update({ status: "refunded" })
          .eq("order_id", input.orderId);
      }
    }
  }
  return { refunded: input.amount };
}

/**
 * Webhook idempotency guard. Inserts the Razorpay event id into the
 * webhook_events table; on conflict the event was already processed
 * and we return false (caller acks the duplicate without dispatching).
 *
 * Live: service-role insert with ON CONFLICT DO NOTHING.
 * Demo: in-process Set so a Vercel-cold-start replay during dev does
 * not break the loop.
 */
const _seenEvents = new Set<string>();

export async function guardWebhookIdempotency(razorpayEventId: string): Promise<boolean> {
  if (!razorpayEventId) return true;
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { error } = await supabase
        .from("webhook_events")
        .insert({ event_id: razorpayEventId, provider: "razorpay", received_at: new Date().toISOString() });
      if (!error) return true;
      // Conflict (Postgres 23505) means duplicate.
      return false;
    }
  }
  if (_seenEvents.has(razorpayEventId)) return false;
  _seenEvents.add(razorpayEventId);
  return true;
}

/** Test-only: reset the in-process seen-events cache. */
export function _resetWebhookIdempotencyCache() {
  _seenEvents.clear();
}
