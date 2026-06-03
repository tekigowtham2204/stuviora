import type { DisputeResolution, DisputeStatus } from "@/lib/types";

/**
 * Dispute engine (M4) — the state machine that protects both sides when an
 * order goes wrong, and the commission-hold logic that freezes money until
 * it's resolved.
 *
 *   open
 *     -> evidence_collection   (both parties upload proof; 48h window)
 *       -> admin_review        (a founder weighs the evidence)
 *         -> resolved          (client_favour | student_favour | partial)
 *
 * While a dispute is anywhere short of `resolved`, the order's
 * commission_event sits in `dispute_hold`: no payout, no auto-release, no
 * commission settlement. Resolution decides how the held escrow unwinds.
 */

/** Allowed forward transitions. Disputes never move backwards. */
const TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  open: ["evidence_collection"],
  evidence_collection: ["admin_review"],
  admin_review: ["resolved"],
  resolved: [],
};

export const DISPUTE_FLOW: DisputeStatus[] = [
  "open",
  "evidence_collection",
  "admin_review",
  "resolved",
];

/** Hours each open stage may sit before it escalates. */
export const ESCALATION_HOURS = 48;

export function canTransition(from: DisputeStatus, to: DisputeStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/** Throwing transition used by Server Actions; keeps illegal states unreachable. */
export function assertTransition(from: DisputeStatus, to: DisputeStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal dispute transition: ${from} -> ${to}`);
  }
}

export function nextStatus(from: DisputeStatus): DisputeStatus | null {
  return TRANSITIONS[from]?.[0] ?? null;
}

/** A stage is escalated once it has been open past the 48h deadline. */
export function isEscalated(deadlineISO: string | null, now = new Date()): boolean {
  if (!deadlineISO) return false;
  return now.getTime() > new Date(deadlineISO).getTime();
}

/** The deadline a newly-entered stage should carry (now + 48h). */
export function stageDeadline(now = new Date()): string {
  return new Date(now.getTime() + ESCALATION_HOURS * 3600_000).toISOString();
}

export interface DisputeOutcome {
  /** Share of escrow returned to the client (0..1). */
  clientRefundRatio: number;
  /** Share of escrow paid out to the student (0..1). */
  studentPayoutRatio: number;
  /** Whether Stuviora keeps its 15% commission on this order. */
  commissionRetained: boolean;
  summary: string;
}

/**
 * Translate an admin resolution into how the held escrow unwinds.
 * `partial` defaults to a 50/50 split; an explicit `studentShare` (0..1)
 * overrides it. Commission is waived on a full client refund.
 */
export function resolveOutcome(
  resolution: DisputeResolution,
  studentShare?: number,
): DisputeOutcome {
  switch (resolution) {
    case "client_favour":
      return {
        clientRefundRatio: 1,
        studentPayoutRatio: 0,
        commissionRetained: false,
        summary: "Full refund to client. Commission reversed, escrow returned.",
      };
    case "student_favour":
      return {
        clientRefundRatio: 0,
        studentPayoutRatio: 1,
        commissionRetained: true,
        summary: "Work accepted. Escrow released to student, commission settled.",
      };
    case "partial": {
      const student = clamp01(studentShare ?? 0.5);
      return {
        clientRefundRatio: round2(1 - student),
        studentPayoutRatio: round2(student),
        commissionRetained: true,
        summary: `Split settlement: ${Math.round(student * 100)}% to student, ${Math.round(
          (1 - student) * 100,
        )}% refunded.`,
      };
    }
    default:
      return {
        clientRefundRatio: 0,
        studentPayoutRatio: 0,
        commissionRetained: false,
        summary: "Pending resolution.",
      };
  }
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
