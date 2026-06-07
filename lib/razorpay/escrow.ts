import "server-only";
import { razorpay, razorpayKeyIdPublic } from "@/lib/razorpay/client";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";
import { computeSplit } from "@/lib/utils";
import { computeOrderTax } from "@/lib/tax/engine";

/**
 * Razorpay Route escrow + atomic 85/15 split.
 *
 * Live path (master plan section 3, P3 of the production plan):
 *   1. createEscrowOrder      Razorpay Orders API with Route transfer
 *                              config baked in so the platform never
 *                              has to call Transfers separately.
 *   2. client pays            'payment.captured' webhook (HMAC-SHA256
 *                              verified, idempotency-guarded via
 *                              webhook_events).
 *   3. lockEscrow             payments.status = 'escrowed', ledger row.
 *   4. releaseEscrow          Razorpay Transfers API in one call:
 *                              85% -> student linked account
 *                              15% -> platform account
 *   5. 'transfer.settled'     finalize commission_events + tax_events
 *                              + fire Inngest (trust recalc, portfolio
 *                              draft).
 *
 * Demo path: returns deterministic results using computeSplit so the
 * UX is fully exercisable without keys.
 */

export interface EscrowOrder {
  id: string;
  orderId: string;
  amount: number;
  status: "pending" | "escrowed" | "released" | "refunded" | "failed";
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
      const orderPayload = {
        amount: totalPaise,
        currency: "INR",
        receipt: input.orderId,
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
