import { describe, it, expect } from "vitest";
import {
  computeOrderTax,
  financialYear,
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

  it("withholds TDS @ 5% once cumulative FY gross crosses Rs.30,000", () => {
    const t = computeOrderTax(10_000, 30_000);
    expect(t.tdsApplied).toBe(true);
    expect(t.tdsWithheld).toBe(425); // 5% of 8500
    expect(t.studentNet).toBe(8_075);
  });

  it("does not apply TDS exactly at the threshold", () => {
    const t = computeOrderTax(1_000, 29_000);
    // 29,000 + 850 = 29,850 < 30,000
    expect(t.tdsApplied).toBe(false);
  });

  it("applies TDS the moment we cross the threshold", () => {
    const t = computeOrderTax(2_000, 29_000);
    // 29,000 + 1,700 = 30,700 > 30,000
    expect(t.tdsApplied).toBe(true);
  });

  it("respects a custom commission rate", () => {
    const t = computeOrderTax(10_000, 0, 0.1); // 10% commission
    expect(t.commission).toBe(1_000);
    expect(t.studentGross).toBe(9_000);
  });

  it("constant rates are sane", () => {
    expect(GST_RATE).toBe(0.18);
    expect(TDS_RATE).toBe(0.05);
    expect(TDS_THRESHOLD).toBe(30_000);
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
