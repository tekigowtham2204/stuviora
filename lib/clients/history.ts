/**
 * Client hiring history (freelancer.com-style "About the client" trust panel).
 *
 * The reference pattern: before a freelancer bids, they see how serious the
 * buyer is - hire rate, total spent, money in escrow now, repeat hires. It
 * answers "will this client actually hire and pay?" which is the single
 * biggest bid-or-skip signal. Pure helper; the page feeds the client's
 * jobs-posted count plus their orders from demo state or live rows.
 */

import type { ClientProfile, Order, OrderStatus } from "@/lib/types";

/** Orders where the client has committed money (escrow funded or released). */
const ESCROW_STATUSES: OrderStatus[] = [
  "active",
  "submitted",
  "in_ai_review",
  "awaiting_approval",
  "revision_requested",
  "disputed",
];
const RELEASED_STATUSES: OrderStatus[] = ["completed"];

export interface ClientHistoryInput {
  client: Pick<ClientProfile, "jobsPosted">;
  /** Every order belonging to this client. */
  orders: Order[];
}

export interface ClientHistory {
  jobsPosted: number;
  /** Distinct jobs that resulted in a funded hire. */
  hires: number;
  /** hires / jobsPosted, capped at 100; null when nothing posted. */
  hireRatePct: number | null;
  /** Money released to students (completed orders). */
  totalSpent: number;
  /** Money currently held in escrow. */
  inEscrow: number;
  /** Count of funded orders (escrow or released). */
  ordersCount: number;
  /** Average funded-order value; null when no funded orders. */
  avgOrderValue: number | null;
  /** Students this client has hired more than once. */
  repeatHires: number;
  /** No funded orders yet - show an honest "new to hiring" state. */
  isNew: boolean;
}

export function computeClientHistory(input: ClientHistoryInput): ClientHistory {
  const jobsPosted = input.client.jobsPosted;
  const funded = input.orders.filter(
    (o) =>
      ESCROW_STATUSES.includes(o.status) || RELEASED_STATUSES.includes(o.status)
  );

  const totalSpent = input.orders
    .filter((o) => RELEASED_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + o.amount, 0);
  const inEscrow = input.orders
    .filter((o) => ESCROW_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + o.amount, 0);

  const hiredJobs = new Set(funded.map((o) => o.jobId));
  const hires = hiredJobs.size;

  const perStudent = new Map<string, number>();
  for (const o of funded) {
    perStudent.set(o.studentId, (perStudent.get(o.studentId) ?? 0) + 1);
  }
  const repeatHires = [...perStudent.values()].filter((n) => n > 1).length;

  const hireRatePct =
    jobsPosted > 0
      ? Math.min(100, Math.round((hires / jobsPosted) * 100))
      : null;
  const avgOrderValue =
    funded.length > 0
      ? Math.round((totalSpent + inEscrow) / funded.length)
      : null;

  return {
    jobsPosted,
    hires,
    hireRatePct,
    totalSpent,
    inEscrow,
    ordersCount: funded.length,
    avgOrderValue,
    repeatHires,
    isNew: funded.length === 0,
  };
}
