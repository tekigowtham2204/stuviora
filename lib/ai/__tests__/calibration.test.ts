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

  it("null precision/catch-rate when no labeled PASS/FAIL exist", () => {
    const s = calibrationStatsFrom([row({ orderId: "x", verdict: "PASS" })]);
    expect(s.passLabeled).toBe(0);
    expect(s.passPrecision).toBeNull();
    expect(s.failLabeled).toBe(0);
    expect(s.failCatchRate).toBeNull();
  });

  it("passPrecision: labeled PASS the human agreed with / labeled PASS", () => {
    const s = calibrationStatsFrom([
      row({ orderId: "a", verdict: "PASS", outcome: "approved" }),
      row({ orderId: "b", verdict: "PASS", outcome: "dispute_student_favour" }),
      row({ orderId: "c", verdict: "PASS", outcome: "dispute_client_favour" }),
      row({ orderId: "d", verdict: "PASS" }), // unlabeled, excluded
    ]);
    expect(s.passLabeled).toBe(3);
    expect(s.passPrecision).toBeCloseTo(2 / 3);
  });

  it("failCatchRate: labeled FAIL the gate was right to hold / labeled FAIL", () => {
    const s = calibrationStatsFrom([
      row({ orderId: "a", verdict: "FAIL", outcome: "revision_requested" }),
      row({ orderId: "b", verdict: "FAIL", outcome: "dispute_client_favour" }),
      row({ orderId: "c", verdict: "FAIL", outcome: "dispute_student_favour" }),
    ]);
    expect(s.failLabeled).toBe(3);
    expect(s.failCatchRate).toBeCloseTo(2 / 3);
  });
});
