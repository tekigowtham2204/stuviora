import { describe, it, expect } from "vitest";
import { suggestPricing } from "@/lib/pricing/engine";
import type { Job } from "@/lib/types";

const job = (partial: Partial<Job> = {}): Job => ({
  id: "job-1",
  clientId: "cli-1",
  title: "x",
  description: "d",
  categorySlug: "tech-development",
  budgetMin: 4_000,
  budgetMax: 10_000,
  deadlineDays: 5,
  skills: ["React"],
  status: "open",
  proposalsCount: 0,
  createdAgo: "now",
  ...partial,
});

describe("suggestPricing", () => {
  it("returns a suggested bid inside the band for a gold student", () => {
    const p = suggestPricing(job(), "gold");
    expect(p.suggested).toBeGreaterThanOrEqual(p.low);
    expect(p.suggested).toBeLessThanOrEqual(p.high);
  });

  it("bronze student bids below the midpoint", () => {
    const j = job();
    const mid = (j.budgetMin + j.budgetMax) / 2;
    const p = suggestPricing(j, "bronze");
    expect(p.suggested).toBeLessThan(mid);
  });

  it("platinum student bids at or above the midpoint", () => {
    const j = job();
    const mid = (j.budgetMin + j.budgetMax) / 2;
    const p = suggestPricing(j, "platinum");
    expect(p.suggested).toBeGreaterThanOrEqual(mid);
  });

  it("never recommends below the category floor", () => {
    const j = job({
      categorySlug: "tech-development",
      budgetMin: 500,
      budgetMax: 2_000,
    });
    const p = suggestPricing(j, "bronze");
    // tech-development floor is Rs.3,000
    expect(p.suggested).toBeGreaterThanOrEqual(3_000);
  });

  it("falls back to a default floor for an unknown category", () => {
    const j = job({ categorySlug: "made-up", budgetMin: 100, budgetMax: 500 });
    const p = suggestPricing(j, "bronze");
    expect(p.suggested).toBeGreaterThanOrEqual(1_500);
  });

  it("returns at least one reasoning string", () => {
    const p = suggestPricing(job(), "gold");
    expect(p.reasoning.length).toBeGreaterThan(0);
  });

  it("high <= budgetMax", () => {
    const j = job();
    const p = suggestPricing(j, "platinum");
    expect(p.high).toBeLessThanOrEqual(j.budgetMax);
  });
});
