import { describe, it, expect } from "vitest";
import {
  listFeaturedPlans,
  planForDays,
  expiryFor,
  isFeaturedActive,
  sortFeaturedFirst,
} from "@/lib/monetization/featured";

describe("featured plans", () => {
  it("resolves a plan by kind + days, null for unknown", () => {
    expect(planForDays("job", 7)?.amountRupees).toBe(999);
    expect(planForDays("job", 5)).toBeNull();
  });

  it("expiryFor adds the plan window to the start", () => {
    const plan = listFeaturedPlans("job")[0]; // 3 days
    expect(expiryFor(plan, 1_000)).toBe(1_000 + 3 * 86400_000);
  });

  it("isFeaturedActive is true only for future timestamps", () => {
    const now = 10_000;
    expect(isFeaturedActive(now + 1, now)).toBe(true);
    expect(isFeaturedActive(now - 1, now)).toBe(false);
    expect(isFeaturedActive(undefined, now)).toBe(false);
  });

  it("sortFeaturedFirst puts active-featured items first, stable otherwise", () => {
    const now = 100;
    const items = [
      { id: "a" },
      { id: "b", featuredUntil: now + 10 },
      { id: "c", featuredUntil: now - 10 }, // expired = not boosted
      { id: "d", featuredUntil: now + 99 },
    ];
    const sorted = sortFeaturedFirst(items, now).map((i) => i.id);
    expect(sorted.slice(0, 2).sort()).toEqual(["b", "d"]);
    // Non-featured keep their relative order.
    expect(sorted.indexOf("a")).toBeLessThan(sorted.indexOf("c"));
  });
});
