/**
 * Pricing engine (M5.2).
 *
 * Pure scoring of a "suggested bid range" for a student on a given job,
 * built to prevent undercharging (master plan §10) while still respecting
 * the client's budget.
 *
 * Inputs come from the job + student trust tier + a category floor table.
 * Output is `{ low, suggested, high, reasoning[] }`.
 *
 * Live path: floors and per-category multipliers should eventually be
 * learned from completed-order data; for now they're tuned constants.
 */

import type { Job, TrustTier } from "@/lib/types";

/** Minimum acceptable price floor by category (anti-race-to-the-bottom). */
const CATEGORY_FLOOR: Record<string, number> = {
  "content-copywriting": 1500,
  "tech-development": 3000,
  "design-creative": 2500,
  "business-research": 2000,
  "social-marketing": 1500,
  "data-ai": 2500,
};

/** Multiplier applied to the budget midpoint based on the student's tier. */
const TIER_MULTIPLIER: Record<TrustTier, number> = {
  bronze: 0.78, // bid below midpoint to win first jobs
  silver: 0.92,
  gold: 1.0,
  platinum: 1.12, // premium pricing
};

/**
 * Per-category price floor (the anti-undercharge minimum). Exposed so UI
 * surfaces (the onboarding pricing tip, service creation) source the same
 * numbers as the bid engine instead of hardcoding their own.
 */
export function priceFloorFor(categorySlug: string): number {
  return CATEGORY_FLOOR[categorySlug] ?? 1500;
}

export interface PricingSuggestion {
  low: number;
  suggested: number;
  high: number;
  reasoning: string[];
}

export function suggestPricing(job: Job, tier: TrustTier): PricingSuggestion {
  const floor = CATEGORY_FLOOR[job.categorySlug] ?? 1500;
  const mid = Math.round((job.budgetMin + job.budgetMax) / 2);
  const mult = TIER_MULTIPLIER[tier];
  const suggested = Math.max(floor, Math.round(mid * mult));
  const span = Math.max(500, Math.round((job.budgetMax - job.budgetMin) * 0.25));
  const low = Math.max(floor, suggested - span);
  const high = Math.min(job.budgetMax, suggested + span);

  const reasoning: string[] = [];
  reasoning.push(`Client budget is ${formatBand(job.budgetMin, job.budgetMax)}.`);
  if (suggested === floor && mid * mult < floor) {
    reasoning.push(
      `Suggested anchors on the category floor to avoid undercharging this kind of work.`
    );
  } else {
    reasoning.push(`Suggested is ${formatTierStance(tier)} the budget midpoint.`);
  }
  if (tier === "bronze") {
    reasoning.push("First-job pricing helps you build reviews and trust faster.");
  }
  if (tier === "platinum") {
    reasoning.push("Platinum tier supports premium pricing on this job.");
  }

  return { low, suggested, high, reasoning };
}

function formatBand(min: number, max: number) {
  return `Rs. ${min.toLocaleString("en-IN")} to Rs. ${max.toLocaleString("en-IN")}`;
}

function formatTierStance(tier: TrustTier) {
  switch (tier) {
    case "bronze":
      return "below";
    case "silver":
      return "just below";
    case "gold":
      return "at";
    case "platinum":
      return "above";
  }
}
