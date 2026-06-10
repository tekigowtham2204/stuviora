import { describe, it, expect } from "vitest";
import { calibrationStatsFrom } from "@/lib/ai/calibration";

type Row = Parameters<typeof calibrationStatsFrom>[0][number];

const row = (p: Partial<Row>): Row => ({
  orderId: "o",
  score: 80,
  verdict: "PASS",
  promptVersion: "v1.0.0",
  decidedAt: 1,
  ...p,
});

describe("calibrationStatsFrom", () => {
  it("returns null rates on an empty log", () => {
    const s = calibrationStatsFrom([]);
    expect(s.decisions).toBe(0);
    expect(s.agreementRate).toBeNull();
    expect(s.passRate).toBeNull();
  });

  it("counts agreement: PASS+approved and FAIL+revision agree", () => {
    const s = calibrationStatsFrom([
      row({ orderId: "a", verdict: "PASS", outcome: "approved" }),
      row({ orderId: "b", verdict: "FAIL", outcome: "revision_requested" }),
      row({ orderId: "c", verdict: "PASS", outcome: "dispute_client_favour" }),
      row({ orderId: "d", verdict: "PASS" }),
    ]);
    expect(s.decisions).toBe(4);
    expect(s.labeled).toBe(3);
    expect(s.agreementRate).toBeCloseTo(2 / 3);
    expect(s.passRate).toBeCloseTo(3 / 4);
  });
});
