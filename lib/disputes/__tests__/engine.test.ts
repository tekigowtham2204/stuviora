import { describe, it, expect } from "vitest";
import {
  canTransition,
  assertTransition,
  nextStatus,
  isEscalated,
  stageDeadline,
  resolveOutcome,
  DISPUTE_FLOW,
  ESCALATION_HOURS,
} from "@/lib/disputes/engine";

describe("canTransition", () => {
  it.each([
    ["open", "evidence_collection", true],
    ["evidence_collection", "admin_review", true],
    ["admin_review", "resolved", true],
    ["open", "resolved", false], // cannot skip
    ["resolved", "open", false], // no backwards
    ["evidence_collection", "open", false],
  ])("from %s to %s -> %s", (from, to, want) => {
    expect(canTransition(from as never, to as never)).toBe(want);
  });
});

describe("assertTransition", () => {
  it("does not throw on a legal transition", () => {
    expect(() => assertTransition("open", "evidence_collection")).not.toThrow();
  });

  it("throws on an illegal transition", () => {
    expect(() => assertTransition("resolved", "open")).toThrow(
      /Illegal dispute transition/
    );
  });
});

describe("nextStatus", () => {
  it("walks the flow", () => {
    expect(nextStatus("open")).toBe("evidence_collection");
    expect(nextStatus("evidence_collection")).toBe("admin_review");
    expect(nextStatus("admin_review")).toBe("resolved");
    expect(nextStatus("resolved")).toBeNull();
  });
});

describe("isEscalated", () => {
  it("returns false for null deadline", () => {
    expect(isEscalated(null)).toBe(false);
  });

  it("returns true when now is past the deadline", () => {
    const past = new Date(Date.now() - 1000).toISOString();
    expect(isEscalated(past)).toBe(true);
  });

  it("returns false when the deadline is in the future", () => {
    const future = new Date(Date.now() + 86400_000).toISOString();
    expect(isEscalated(future)).toBe(false);
  });
});

describe("stageDeadline", () => {
  it("returns now + ESCALATION_HOURS", () => {
    const now = new Date("2026-06-01T00:00:00.000Z");
    const deadline = new Date(stageDeadline(now));
    const hours = (deadline.getTime() - now.getTime()) / 3600_000;
    expect(hours).toBe(ESCALATION_HOURS);
  });
});

describe("resolveOutcome", () => {
  it("client favour refunds 100%, waives commission", () => {
    const r = resolveOutcome("client_favour");
    expect(r.clientRefundRatio).toBe(1);
    expect(r.studentPayoutRatio).toBe(0);
    expect(r.commissionRetained).toBe(false);
  });

  it("student favour pays 100%, keeps commission", () => {
    const r = resolveOutcome("student_favour");
    expect(r.clientRefundRatio).toBe(0);
    expect(r.studentPayoutRatio).toBe(1);
    expect(r.commissionRetained).toBe(true);
  });

  it("partial defaults to 50/50", () => {
    const r = resolveOutcome("partial");
    expect(r.clientRefundRatio).toBe(0.5);
    expect(r.studentPayoutRatio).toBe(0.5);
    expect(r.commissionRetained).toBe(true);
  });

  it("partial honors explicit student share", () => {
    const r = resolveOutcome("partial", 0.7);
    expect(r.studentPayoutRatio).toBe(0.7);
    expect(r.clientRefundRatio).toBe(0.3);
  });

  it("partial clamps student share to [0,1]", () => {
    expect(resolveOutcome("partial", -0.5).studentPayoutRatio).toBe(0);
    expect(resolveOutcome("partial", 1.5).studentPayoutRatio).toBe(1);
  });
});

describe("DISPUTE_FLOW", () => {
  it("contains the canonical sequence", () => {
    expect(DISPUTE_FLOW).toEqual([
      "open",
      "evidence_collection",
      "admin_review",
      "resolved",
    ]);
  });
});
