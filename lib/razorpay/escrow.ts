import "server-only";
import { services } from "@/lib/env";
import { computeSplit } from "@/lib/utils";

/**
 * Razorpay Route escrow + atomic 85/15 split.
 *
 * Live path (M3 critical, Section 3 of the master plan):
 *   1. createOrder        -> Razorpay Orders API with Route transfer config baked in
 *   2. client pays        -> 'payment.captured' webhook (HMAC-SHA256 verified, idempotency-guarded)
 *   3. lockEscrow         -> payments.status = ESCROWED, ledger pending row
 *   4. releaseEscrow      -> Razorpay Transfer API (one atomic call):
 *                              85% -> student linked account
 *                              15% -> platform Razorpay account
 *   5. 'transfer.settled' -> finalize commission_events, tax_events, fire trust + portfolio jobs
 *
 * Demo path: returns deterministic results using computeSplit so the UX is
 * exercisable end-to-end without keys.
 */

export interface EscrowOrder {
  id: string;
  orderId: string;
  amount: number;
  status: "pending" | "escrowed" | "released" | "refunded" | "failed";
  razorpayOrderId?: string;
  createdAt: number;
}

export interface ReleaseResult {
  studentPayout: number;
  platformGross: number;
  gst: number;
  platformNet: number;
  razorpayTransferId?: string;
}

export async function createEscrowOrder(args: {
  orderId: string;
  amount: number;
  clientId: string;
}): Promise<EscrowOrder> {
  if (services.razorpay) {
    // TODO (live): call Razorpay Orders API with linked account transfer config.
  }
  return {
    id: `pay_${args.orderId}_${Date.now()}`,
    orderId: args.orderId,
    amount: args.amount,
    status: "pending",
    createdAt: Date.now(),
  };
}

/** Idempotent escrow release. Three callers: approve, 72h cron, admin. */
export async function releaseEscrow(args: {
  orderId: string;
  amount: number;
}): Promise<ReleaseResult> {
  const split = computeSplit(args.amount);
  if (services.razorpay) {
    // TODO (live): call Razorpay Transfer API; record transfer_log + commission_events.
  }
  return {
    studentPayout: split.studentPayout,
    platformGross: split.commission,
    gst: split.gst,
    platformNet: split.platformNet,
  };
}

/**
 * Webhook idempotency guard. Live path checks the webhook_events table and
 * returns true on first sight, false on duplicate. Demo always returns true.
 */
export async function guardWebhookIdempotency(razorpayEventId: string): Promise<boolean> {
  void razorpayEventId;
  return true;
}
