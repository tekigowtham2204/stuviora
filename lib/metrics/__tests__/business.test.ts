import { describe, it, expect } from "vitest";
import {
  repeatClientRate,
  takeRate,
  medianDays,
  modelContributionMargin,
  computeBusinessMetrics,
} from "@/lib/metrics/business";
import { COMMISSION_RATE, COST_ASSUMPTIONS } from "@/lib/constants";

describe("repeatClientRate", () => {
  it("null when no client completed an order", () => {
    expect(repeatClientRate([])).toBeNull();
    expect(
      repeatClientRate([{ clientId: "a", completed: false }])
    ).toBeNull();
  });

  it("ignores uncompleted orders and counts repeat clients", () => {
    const rate = repeatClientRate([
      { clientId: "a", completed: true },
      { clientId: "a", completed: true }, // a is a repeat
      { clientId: "b", completed: true }, // b is one-time
      { clientId: "c", completed: false }, // not counted at all
    ]);
    expect(rate).toBeCloseTo(1 / 2); // a of {a,b}
  });
});

describe("takeRate", () => {
  it("null when GMV is zero", () => {
    expect(takeRate(0, 0)).toBeNull();
  });
  it("revenue over GMV", () => {
    expect(takeRate(1000, 150)).toBeCloseTo(0.15);
  });
});

describe("medianDays", () => {
  it("null when empty", () => {
    expect(medianDays([])).toBeNull();
  });
  it("odd length", () => {
    expect(medianDays([5, 1, 3])).toBe(3);
  });
  it("even length averages the middle two", () => {
    expect(medianDays([1, 2, 3, 4])).toBe(2.5);
  });
});

describe("modelContributionMargin", () => {
  it("revenue is the commission rate, cost uses the assumptions", () => {
    const aov = 5000;
    const m = modelContributionMargin(aov);
    expect(m.revenuePerOrder).toBeCloseTo(aov * COMMISSION_RATE);
    expect(m.variableCostPerOrder).toBeCloseTo(
      aov * COST_ASSUMPTIONS.paymentProcessingRate +
        COST_ASSUMPTIONS.gateCostPerOrder +
        COST_ASSUMPTIONS.payoutFeePerOrder
    );
    expect(m.marginPerOrder).toBeCloseTo(
      m.revenuePerOrder - m.variableCostPerOrder
    );
    expect(m.marginRate).toBeCloseTo(m.marginPerOrder / m.revenuePerOrder);
  });

  it("marginRate is null with zero order value", () => {
    expect(modelContributionMargin(0).marginRate).toBeNull();
  });
});

describe("computeBusinessMetrics", () => {
  it("derives avgOrderValue from GMV and completed count", () => {
    const m = computeBusinessMetrics({
      gmv: 10000,
      revenueNet: 1500,
      completedOrderCount: 2,
      clientOrders: [
        { clientId: "a", completed: true },
        { clientId: "a", completed: true },
      ],
      daysToFirstOrder: [2, 4],
      gatePrecision: 0.9,
    });
    expect(m.avgOrderValue).toBe(5000);
    expect(m.takeRate).toBeCloseTo(0.15);
    expect(m.repeatClientRate).toBeCloseTo(1);
    expect(m.medianDaysToFirstOrder).toBe(3);
    expect(m.gatePrecision).toBe(0.9);
  });

  it("avgOrderValue is zero (not NaN) with no completed orders", () => {
    const m = computeBusinessMetrics({
      gmv: 0,
      revenueNet: 0,
      completedOrderCount: 0,
      clientOrders: [],
      daysToFirstOrder: [],
      gatePrecision: null,
    });
    expect(m.avgOrderValue).toBe(0);
    expect(m.takeRate).toBeNull();
    expect(m.repeatClientRate).toBeNull();
    expect(m.medianDaysToFirstOrder).toBeNull();
  });
});
