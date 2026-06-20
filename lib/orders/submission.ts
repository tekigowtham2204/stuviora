import type { OrderStatus } from "@/lib/types";

/**
 * Submission outcome engine: turns an AI-gate verdict + the attempt count
 * into what actually happens to the order. This is what makes the moat
 * load-bearing - the verdict is enforced, not just displayed.
 *
 *   PASS                         -> awaiting_approval, client notified.
 *   FAIL with revisions left     -> revision_requested, client NOT notified
 *                                   (failing work never reaches the client).
 *   FAIL with no revisions left  -> disputed (founder mediation / refund).
 */

export type SubmissionStatus = Extract<
  OrderStatus,
  "awaiting_approval" | "revision_requested" | "disputed"
>;

export interface SubmissionOutcomeInput {
  verdict: "PASS" | "FAIL";
  /** This submission's attempt number, 1-based (1 = first try). */
  attempt: number;
  /** Attempts allowed before escalation (MAX_REVISIONS). */
  maxAttempts: number;
}

export interface SubmissionOutcome {
  status: SubmissionStatus;
  /** Whether the client should be notified that work is ready. */
  notifyClient: boolean;
  /** Revision attempts still available after this one. */
  attemptsLeft: number;
  /** Out of revisions and still failing -> escalated to mediation. */
  escalated: boolean;
}

export function resolveSubmissionOutcome({
  verdict,
  attempt,
  maxAttempts,
}: SubmissionOutcomeInput): SubmissionOutcome {
  const attemptsLeft = Math.max(0, maxAttempts - attempt);

  if (verdict === "PASS") {
    return {
      status: "awaiting_approval",
      notifyClient: true,
      attemptsLeft,
      escalated: false,
    };
  }

  // FAIL: only ship a revision request while attempts remain; otherwise the
  // order can never auto-deliver, so escalate for founder mediation/refund.
  if (attemptsLeft <= 0) {
    return {
      status: "disputed",
      notifyClient: true,
      attemptsLeft: 0,
      escalated: true,
    };
  }
  return {
    status: "revision_requested",
    notifyClient: false,
    attemptsLeft,
    escalated: false,
  };
}
