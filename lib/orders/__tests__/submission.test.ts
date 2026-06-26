import { describe, it, expect } from "vitest";
import { resolveSubmissionOutcome } from "@/lib/orders/submission";

const MAX = 3;

describe("resolveSubmissionOutcome", () => {
  it("PASS goes to awaiting_approval and notifies the client", () => {
    expect(
      resolveSubmissionOutcome({ verdict: "PASS", attempt: 1, maxAttempts: MAX })
    ).toMatchObject({
      status: "awaiting_approval",
      notifyClient: true,
      autoRefunded: false,
    });
  });

  it("FAIL with revisions left requests a revision and does NOT notify the client", () => {
    const o = resolveSubmissionOutcome({ verdict: "FAIL", attempt: 1, maxAttempts: MAX });
    expect(o.status).toBe("revision_requested");
    expect(o.notifyClient).toBe(false);
    expect(o.attemptsLeft).toBe(2);
    expect(o.autoRefunded).toBe(false);
  });

  it("FAIL on the second attempt still allows one more", () => {
    const o = resolveSubmissionOutcome({ verdict: "FAIL", attempt: 2, maxAttempts: MAX });
    expect(o.status).toBe("revision_requested");
    expect(o.attemptsLeft).toBe(1);
  });

  it("FAIL on the final attempt auto-refunds the client (no human dispute)", () => {
    const o = resolveSubmissionOutcome({ verdict: "FAIL", attempt: 3, maxAttempts: MAX });
    expect(o.status).toBe("refunded");
    expect(o.autoRefunded).toBe(true);
    expect(o.notifyClient).toBe(true);
    expect(o.attemptsLeft).toBe(0);
  });

  it("never reaches negative attempts left", () => {
    const o = resolveSubmissionOutcome({ verdict: "FAIL", attempt: 9, maxAttempts: MAX });
    expect(o.attemptsLeft).toBe(0);
    expect(o.autoRefunded).toBe(true);
  });
});
