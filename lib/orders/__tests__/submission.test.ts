import { describe, it, expect } from "vitest";
import {
  resolveSubmissionOutcome,
  resolveClientDispute,
} from "@/lib/orders/submission";

const MAX = 3;

describe("resolveSubmissionOutcome", () => {
  it("PASS goes to awaiting_approval and captures the auth", () => {
    expect(
      resolveSubmissionOutcome({ verdict: "PASS", attempt: 1, maxAttempts: MAX })
    ).toMatchObject({
      status: "awaiting_approval",
      notifyClient: true,
      terminallyFailed: false,
      authAction: "capture",
    });
  });

  it("FAIL with revisions left requests a revision, no client notify, no auth move", () => {
    const o = resolveSubmissionOutcome({ verdict: "FAIL", attempt: 1, maxAttempts: MAX });
    expect(o.status).toBe("revision_requested");
    expect(o.notifyClient).toBe(false);
    expect(o.attemptsLeft).toBe(2);
    expect(o.terminallyFailed).toBe(false);
    expect(o.authAction).toBe("noop");
  });

  it("FAIL on the second attempt still allows one more, still no auth move", () => {
    const o = resolveSubmissionOutcome({ verdict: "FAIL", attempt: 2, maxAttempts: MAX });
    expect(o.status).toBe("revision_requested");
    expect(o.attemptsLeft).toBe(1);
    expect(o.authAction).toBe("noop");
  });

  it("FAIL on the final attempt voids the auth and refunds the order", () => {
    const o = resolveSubmissionOutcome({ verdict: "FAIL", attempt: 3, maxAttempts: MAX });
    expect(o.status).toBe("refunded");
    expect(o.terminallyFailed).toBe(true);
    expect(o.attemptsLeft).toBe(0);
    expect(o.notifyClient).toBe(true);
    expect(o.authAction).toBe("void");
  });

  it("never reaches negative attempts left", () => {
    const o = resolveSubmissionOutcome({ verdict: "FAIL", attempt: 9, maxAttempts: MAX });
    expect(o.attemptsLeft).toBe(0);
    expect(o.terminallyFailed).toBe(true);
    expect(o.authAction).toBe("void");
  });
});

describe("resolveClientDispute", () => {
  it("dispute with revisions left refunds and re-opens for revision", () => {
    const o = resolveClientDispute({ attemptsUsed: 1, maxAttempts: MAX });
    expect(o.status).toBe("revision_requested");
    expect(o.attemptsLeft).toBe(2);
    expect(o.terminallyFailed).toBe(false);
    expect(o.authAction).toBe("refund");
  });

  it("dispute on the last attempt terminally refunds the client", () => {
    const o = resolveClientDispute({ attemptsUsed: 3, maxAttempts: MAX });
    expect(o.status).toBe("refunded");
    expect(o.attemptsLeft).toBe(0);
    expect(o.terminallyFailed).toBe(true);
    expect(o.authAction).toBe("refund");
  });

  it("dispute past the cap still refunds without going negative", () => {
    const o = resolveClientDispute({ attemptsUsed: 9, maxAttempts: MAX });
    expect(o.attemptsLeft).toBe(0);
    expect(o.terminallyFailed).toBe(true);
  });
});
