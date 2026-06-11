import { describe, it, expect } from "vitest";
import {
  computeOrderTax,
  financialYear,
  fiscalQuarter,
  summariseByQuarter,
  maskPan,
  buildForm16A,
  GST_RATE,
  TDS_RATE,
  TDS_THRESHOLD,
} from "@/lib/tax/engine";

describe("computeOrderTax", () => {
  it("computes the 85/15 split with 18% GST on commission, no TDS under threshold", () => {
    const t = computeOrderTax(10_000, 0);
    expect(t.jobAmount).toBe(10_000);
    expect(t.commission).toBe(1_500);
    expect(t.gstOnCommission).toBe(270);
    expect(t.commissionWithGst).toBe(1_770);
    expect(t.studentGross).toBe(8_500);
    expect(t.tdsWithheld).toBe(0);
    expect(t.tdsApplied).toBe(false);
    expect(t.studentNet).toBe(8_500);
  });

  it("withholds TDS @ 0.1% of gross once cumulative FY gross crosses Rs.5,00,000 (194-O)", () => {
    const t = computeOrderTax(10_000, 500_000);
    expect(t.tdsApplied).toBe(true);
    expect(t.tdsWithheld).toBe(10); // 0.1% of the 10,000 gross (194-O base)
    expect(t.studentNet).toBe(8_490); // 8,500 minus 0.1% of gross
  });

  it("does not apply TDS exactly at the threshold", () => {
    const t = computeOrderTax(1_000, 499_000);
    // 499,000 + 1,000 gross = 500,000, not above the 5L threshold
    expect(t.tdsApplied).toBe(false);
  });

  it("applies TDS the moment gross crosses the threshold", () => {
    const t = computeOrderTax(2_000, 499_000);
    // 499,000 + 2,000 gross = 501,000 > 500,000
    expect(t.tdsApplied).toBe(true);
  });

  it("respects a custom commission rate", () => {
    const t = computeOrderTax(10_000, 0, 0.1); // 10% commission
    expect(t.commission).toBe(1_000);
    expect(t.studentGross).toBe(9_000);
  });

  it("constant rates are sane", () => {
    expect(GST_RATE).toBe(0.18);
    expect(TDS_RATE).toBe(0.001);
    expect(TDS_THRESHOLD).toBe(500_000);
  });
});

describe("financialYear", () => {
  it("April 1 starts a new FY", () => {
    expect(financialYear(new Date("2026-04-01"))).toBe("2026-27");
  });

  it("March 31 belongs to the previous FY", () => {
    expect(financialYear(new Date("2026-03-31"))).toBe("2025-26");
  });

  it("January 1 belongs to the FY that started the previous April", () => {
    expect(financialYear(new Date("2027-01-15"))).toBe("2026-27");
  });
});

describe("maskPan", () => {
  it("masks the middle 4 characters", () => {
    expect(maskPan("ABCDE1234F")).toBe("ABCxxxx34F");
  });

  it("returns a placeholder for invalid length", () => {
    expect(maskPan("ABC")).toBe("xxxxxxxxxx");
  });
});

describe("fiscalQuarter", () => {
  it.each([
    [new Date("2026-04-01"), "Q1"],
    [new Date("2026-06-30"), "Q1"],
    [new Date("2026-07-01"), "Q2"],
    [new Date("2026-09-30"), "Q2"],
    [new Date("2026-10-01"), "Q3"],
    [new Date("2026-12-31"), "Q3"],
    [new Date("2027-01-01"), "Q4"],
    [new Date("2027-03-31"), "Q4"],
  ])("classifies %s as %s", (d, q) => {
    expect(fiscalQuarter(d)).toBe(q);
  });
});

describe("summariseByQuarter", () => {
  it("buckets events by quarter and totals", () => {
    const r = summariseByQuarter([
      { date: "2026-05-15", studentGross: 4250, tdsWithheld: 212.5 },
      { date: "2026-04-22", studentGross: 6800, tdsWithheld: 340 },
      { date: "2026-08-10", studentGross: 3000, tdsWithheld: 0 },
    ]);
    expect(r.Q1.ordersCount).toBe(2);
    expect(r.Q1.studentGross).toBe(11050);
    expect(r.Q1.tdsWithheld).toBe(552.5);
    expect(r.Q2.ordersCount).toBe(1);
    expect(r.Q2.studentGross).toBe(3000);
    expect(r.Q3.ordersCount).toBe(0);
    expect(r.Q4.ordersCount).toBe(0);
  });

  it("handles empty input", () => {
    const r = summariseByQuarter([]);
    expect(r.Q1.ordersCount).toBe(0);
    expect(r.Q4.studentGross).toBe(0);
  });
});

describe("buildForm16A", () => {
  it("aggregates events into a Form 16A summary", () => {
    const form = buildForm16A({
      studentName: "Test",
      panMasked: "ABCxxxx34F",
      events: [
        { studentGross: 5_000, tdsWithheld: 250 },
        { studentGross: 3_000, tdsWithheld: 150 },
      ],
    });
    expect(form.studentName).toBe("Test");
    expect(form.ordersCount).toBe(2);
    expect(form.totalGross).toBe(8_000);
    expect(form.totalTdsWithheld).toBe(400);
    expect(form.deductorTan).toBe("BLRS00000F");
  });
});
