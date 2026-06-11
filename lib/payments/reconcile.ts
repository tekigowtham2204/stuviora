/**
 * Commission + payout reconciler (P8).
 *
 * The master plan's #1 money guardrail is "double-payout count: zero,
 * ever". Razorpay retries webhooks, so without idempotency a student can
 * be paid twice; and a transfer can settle without its commission being
 * booked. This pure engine cross-checks settled transfer events against
 * the commission ledger and reports drift. The daily Inngest reconciler
 * (commissionReconciler) feeds it real rows; here it stays I/O-free and
 * fully testable.
 */

import { computeSplit } from "@/lib/utils";
import { COMMISSION_RATE } from "@/lib/constants";

/** A settled (or attempted) Razorpay transfer for an order. */
export interface TransferEvent {
  /** Razorpay event id (x-razorpay-event-id) for idempotency. */
  eventId: string;
  orderId: string;
  amount: number;
  status: "processed" | "failed" | "reversed";
}

/** A commission ledger row booked when an order completes. */
export interface CommissionEntry {
  orderId: string;
  orderAmount: number;
  commission: number;
}

export type ReconIssueKind =
  | "double_payout"
  | "missing_commission"
  | "orphan_commission"
  | "commission_mismatch"
  | "duplicate_event";

export interface ReconIssue {
  kind: ReconIssueKind;
  orderId: string;
  detail: string;
}

export interface ReconReport {
  ok: boolean;
  ordersChecked: number;
  settledTransfers: number;
  issues: ReconIssue[];
}

/**
 * Reconcile settled transfers against commission entries.
 *
 * Tolerance lets rounding (e.g. GST rounding) off by a rupee or two pass;
 * default 1 rupee.
 */
export function reconcileCommissions(
  transfers: TransferEvent[],
  commissions: CommissionEntry[],
  opts: { commissionRate?: number; toleranceInr?: number } = {}
): ReconReport {
  const rate = opts.commissionRate ?? COMMISSION_RATE;
  const tolerance = opts.toleranceInr ?? 1;
  const issues: ReconIssue[] = [];

  // 1. Duplicate event ids (idempotency breach at the webhook layer).
  const seenEvents = new Set<string>();
  for (const t of transfers) {
    if (seenEvents.has(t.eventId)) {
      issues.push({
        kind: "duplicate_event",
        orderId: t.orderId,
        detail: `Repeated transfer event ${t.eventId}.`,
      });
    }
    seenEvents.add(t.eventId);
  }

  // Count distinct settled transfers per order (by event id, so a retried
  // event with the same id is not a real second payout).
  const settledByOrder = new Map<string, Set<string>>();
  for (const t of transfers) {
    if (t.status !== "processed") continue;
    const set = settledByOrder.get(t.orderId) ?? new Set<string>();
    set.add(t.eventId);
    settledByOrder.set(t.orderId, set);
  }

  // 2. Double payout: more than one distinct settled transfer for an order.
  for (const [orderId, events] of settledByOrder) {
    if (events.size > 1) {
      issues.push({
        kind: "double_payout",
        orderId,
        detail: `${events.size} distinct settled transfers for one order.`,
      });
    }
  }

  const commissionByOrder = new Map<string, CommissionEntry>();
  for (const c of commissions) commissionByOrder.set(c.orderId, c);

  // 3. Settled transfer with no commission booked + amount checks.
  for (const orderId of settledByOrder.keys()) {
    const entry = commissionByOrder.get(orderId);
    if (!entry) {
      issues.push({
        kind: "missing_commission",
        orderId,
        detail: "Settled transfer has no commission ledger entry.",
      });
      continue;
    }
    const expected = computeSplit(entry.orderAmount, rate).commission;
    if (Math.abs(expected - entry.commission) > tolerance) {
      issues.push({
        kind: "commission_mismatch",
        orderId,
        detail: `Commission ${entry.commission} != expected ${expected}.`,
      });
    }
  }

  // 4. Commission booked but no settled transfer (orphan).
  for (const c of commissions) {
    if (!settledByOrder.has(c.orderId)) {
      issues.push({
        kind: "orphan_commission",
        orderId: c.orderId,
        detail: "Commission booked with no settled transfer.",
      });
    }
  }

  return {
    ok: issues.length === 0,
    ordersChecked: new Set([
      ...settledByOrder.keys(),
      ...commissions.map((c) => c.orderId),
    ]).size,
    settledTransfers: [...settledByOrder.values()].reduce(
      (n, s) => n + s.size,
      0
    ),
    issues,
  };
}
