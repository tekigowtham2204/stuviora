import type { OrderStatus } from "@/lib/types";

/**
 * Submission outcome engine: turns an AI-gate verdict + the attempt count
 * into what actually happens to the order. This is what makes the moat
 * load-bearing - the verdict is enforced, not just displayed. There is no
 * human in this loop: the gate decides, and money follows automatically.
 *
 *   PASS                         -> awaiting_approval (delivered, dispute
 *                                   window open); client charged on receipt.
 *   FAIL with revisions left     -> revision_requested, client NOT notified
 *                                   (failing work never reaches the client).
 *   FAIL with no revisions left  -> refunded: the held authorization is voided
 *                                   and the client pays nothing. No mediation,
 *                                   no staff - unpassable work is never charged.
 */

export type SubmissionStatus = Extract<
  OrderStatus,
  "awaiting_approval" | "revision_requested" | "refunded"
>;

export interface SubmissionOutcomeInput {
  verdict: "PASS" | "FAIL";
  /** This submission's attempt number, 1-based (1 = first try). */
  attempt: number;
  /** Attempts allowed before auto-refund (MAX_REVISIONS). */
  maxAttempts: number;
}

export interface SubmissionOutcome {
  status: SubmissionStatus;
  /** Whether the client should be notified (work ready, or order refunded). */
  notifyClient: boolean;
  /** Revision attempts still available after this one. */
  attemptsLeft: number;
  /** Out of revisions and still failing -> authorization voided, auto-refund. */
  autoRefunded: boolean;
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
      autoRefunded: false,
    };
  }

  // FAIL: only ship a revision request while attempts remain; otherwise the
  // order can never pass the gate, so the held authorization is voided and the
  // client is refunded automatically. Nobody mediates - unpassable work is
  // simply never paid for.
  if (attemptsLeft <= 0) {
    return {
      status: "refunded",
      notifyClient: true,
      attemptsLeft: 0,
      autoRefunded: true,
    };
  }
  return {
    status: "revision_requested",
    notifyClient: false,
    attemptsLeft,
    autoRefunded: false,
  };
}
