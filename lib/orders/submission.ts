import type { OrderStatus } from "@/lib/types";

/**
 * Submission outcome engine: turns an AI-gate verdict + the attempt count
 * into what actually happens to the order, including the payment-side
 * verb (capture / void / noop). This is what makes the loop autonomous:
 * no humans needed for healthy or terminal-failure orders.
 *
 * Order at hire = card AUTHORISED, not charged. The verdict drives:
 *
 *   PASS                         -> awaiting_approval (the dispute window),
 *                                   CAPTURE the auth, client notified.
 *   FAIL with revisions left     -> revision_requested, NO capture, NO void
 *                                   (the auth keeps holding for the retry).
 *   FAIL with no revisions left  -> refunded, VOID the auth (client pays
 *                                   nothing; no dispute case is opened).
 */

export type SubmissionStatus = Extract<
  OrderStatus,
  "awaiting_approval" | "revision_requested" | "refunded"
>;

/**
 * What the payment processor must do as part of this state transition.
 *   capture  the held authorisation is captured (client charged).
 *   void     the held authorisation is released (client never charged).
 *   noop     nothing changes on the auth; it keeps holding.
 */
export type AuthAction = "capture" | "void" | "noop";

export interface SubmissionOutcomeInput {
  verdict: "PASS" | "FAIL";
  /** This submission's attempt number, 1-based (1 = first try). */
  attempt: number;
  /** Attempts allowed before terminal-fail/refund (MAX_REVISIONS). */
  maxAttempts: number;
}

export interface SubmissionOutcome {
  status: SubmissionStatus;
  /** Whether the client should be notified about this transition. */
  notifyClient: boolean;
  /** Revision attempts still available after this one. */
  attemptsLeft: number;
  /** Terminal fail: 3x FAIL hit, auth voided, no human in the loop. */
  terminallyFailed: boolean;
  /** The verb to run on the held payment authorisation. */
  authAction: AuthAction;
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
      terminallyFailed: false,
      authAction: "capture",
    };
  }

  // FAIL out of revisions: terminal fail. Void the auth and refund the order
  // to the client. No human dispute case is opened.
  if (attemptsLeft <= 0) {
    return {
      status: "refunded",
      notifyClient: true,
      attemptsLeft: 0,
      terminallyFailed: true,
      authAction: "void",
    };
  }

  // FAIL with revisions left: the auth keeps holding, the student retries.
  return {
    status: "revision_requested",
    notifyClient: false,
    attemptsLeft,
    terminallyFailed: false,
    authAction: "noop",
  };
}

/**
 * Client-initiated dispute resolver: triggered when the client raises a
 * dispute during the awaiting_approval window (after a PASS + capture).
 * No staff in the loop. The engine forces an AI gate re-run if revisions
 * remain (refund + revision_requested), or refunds outright if not.
 *
 *   revisions remain  -> revision_requested, REFUND the capture.
 *   no revisions left -> refunded,           REFUND the capture.
 */

export type DisputeResolutionStatus = Extract<
  OrderStatus,
  "revision_requested" | "refunded"
>;

export type DisputeAuthAction = "refund";

export interface ClientDisputeInput {
  /** How many submission attempts the order has already used. */
  attemptsUsed: number;
  /** Same cap as resolveSubmissionOutcome (MAX_REVISIONS). */
  maxAttempts: number;
}

export interface ClientDisputeOutcome {
  status: DisputeResolutionStatus;
  /** Revision attempts still available after this dispute. */
  attemptsLeft: number;
  /** True when the dispute terminally ends the order (no retries left). */
  terminallyFailed: boolean;
  /** The verb to run on the captured payment. */
  authAction: DisputeAuthAction;
}

export function resolveClientDispute({
  attemptsUsed,
  maxAttempts,
}: ClientDisputeInput): ClientDisputeOutcome {
  const attemptsLeft = Math.max(0, maxAttempts - attemptsUsed);

  if (attemptsLeft <= 0) {
    return {
      status: "refunded",
      attemptsLeft: 0,
      terminallyFailed: true,
      authAction: "refund",
    };
  }

  return {
    status: "revision_requested",
    attemptsLeft,
    terminallyFailed: false,
    authAction: "refund",
  };
}
