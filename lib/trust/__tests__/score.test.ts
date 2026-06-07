import { describe, it, expect } from "vitest";
import {
  computeTrustScore,
  tierForScore,
  canAcceptBudget,
  nextTier,
  TIER_BUDGET_CEILING,
  TRUST_WEIGHTS,
  type TrustSignals,
} from "@/lib/trust/score";

const perfect: TrustSignals = {
  avgRating: 5,
  reviewsCount: 20,
  ordersOnTime: 20,
  ordersDelivered: 20,
  aiFirstPass: 20,
  aiSubmissions: 20,
  medianResponseHours: 1,
};

const zero: TrustSignals = {
  avgRating: 0,
  reviewsCount: 0,
  ordersOnTime: 0,
  ordersDelivered: 0,
  aiFirstPass: 0,
  aiSubmissions: 0,
  medianResponseHours: 100,
};

describe("computeTrustScore", () => {
  it("returns 100 for a perfectly trustworthy student", () => {
    const r = computeTrustScore(perfect);
    expect(r.score).toBe(100);
    expect(r.tier).toBe("platinum");
    expect(r.components).toHaveLength(4);
    for (const c of r.components) {
      expect(c.value).toBe(100);
    }
  });

  it("returns 0 for an empty / unresponsive student", () => {
    const r = computeTrustScore(zero);
    expect(r.score).toBe(0);
    expect(r.tier).toBe("bronze");
  });

  it("weights sum to 1.0", () => {
    const total = Object.values(TRUST_WEIGHTS).reduce((s, w) => s + w, 0);
    expect(total).toBeCloseTo(1.0, 5);
  });

  it("rating absent (zero reviews) zeroes the rating component", () => {
    const r = computeTrustScore({
      ...perfect,
      avgRating: 5,
      reviewsCount: 0,
    });
    const ratingComp = r.components.find((c) => c.label === "Client ratings")!;
    expect(ratingComp.value).toBe(0);
  });

  it("response time decays linearly between 2h and 48h", () => {
    const fast = computeTrustScore({ ...perfect, medianResponseHours: 2 });
    const mid = computeTrustScore({ ...perfect, medianResponseHours: 25 });
    const slow = computeTrustScore({ ...perfect, medianResponseHours: 48 });
    const fastResp = fast.components.find((c) => c.label === "Responsiveness")!;
    const midResp = mid.components.find((c) => c.label === "Responsiveness")!;
    const slowResp = slow.components.find((c) => c.label === "Responsiveness")!;
    expect(fastResp.value).toBe(100);
    expect(slowResp.value).toBe(0);
    expect(midResp.value).toBeGreaterThan(40);
    expect(midResp.value).toBeLessThan(60);
  });

  it("on-time rate scales the on-time component linearly", () => {
    const half = computeTrustScore({
      ...perfect,
      ordersOnTime: 10,
      ordersDelivered: 20,
    });
    const onTime = half.components.find((c) => c.label === "On-time delivery")!;
    expect(onTime.value).toBe(50);
  });
});

describe("tierForScore", () => {
  it.each([
    [0, "bronze"],
    [59.9, "bronze"],
    [60, "silver"],
    [77.9, "silver"],
    [78, "gold"],
    [89.9, "gold"],
    [90, "platinum"],
    [100, "platinum"],
  ])("score %f maps to tier %s", (score, tier) => {
    expect(tierForScore(score)).toBe(tier);
  });
});

describe("canAcceptBudget", () => {
  it("bronze tops out at Rs.5,000", () => {
    expect(canAcceptBudget("bronze", 5_000)).toBe(true);
    expect(canAcceptBudget("bronze", 5_001)).toBe(false);
  });

  it("platinum accepts unlimited budget", () => {
    expect(canAcceptBudget("platinum", 10_000_000)).toBe(true);
  });

  it("ceilings are monotonic", () => {
    expect(TIER_BUDGET_CEILING.bronze).toBeLessThan(TIER_BUDGET_CEILING.silver);
    expect(TIER_BUDGET_CEILING.silver).toBeLessThan(TIER_BUDGET_CEILING.gold);
    expect(TIER_BUDGET_CEILING.gold).toBeLessThan(TIER_BUDGET_CEILING.platinum);
  });
});

describe("nextTier", () => {
  it("returns silver target for a bronze score", () => {
    const next = nextTier(50);
    expect(next?.name).toBe("Silver");
    expect(next?.pointsAway).toBe(10);
  });

  it("returns null for a platinum score", () => {
    expect(nextTier(95)).toBeNull();
  });
});
