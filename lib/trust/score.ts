import type { TrustTier } from "@/lib/types";
import { TRUST_TIERS } from "@/lib/constants";

/**
 * Trust-score engine (M4).
 *
 * The single number that gates higher-budget work and earns the
 * Bronze -> Silver -> Gold -> Platinum tiers. Recomputed after every
 * completed order, every review, and every AI verdict; each change is
 * appended to `trust_score_history` so a student can see why it moved.
 *
 *   score = avg_rating x 0.40
 *         + on_time    x 0.25
 *         + ai_pass     x 0.20
 *         + response    x 0.15
 *
 * Every input is normalized to 0..100 before weighting, so the result is
 * itself a clean 0..100. Weights are the master-plan formula and live here
 * as the single source of truth.
 */

export const TRUST_WEIGHTS = {
  rating: 0.4,
  onTime: 0.25,
  aiPass: 0.2,
  response: 0.15,
} as const;

/** Raw signals collected from a student's order history. */
export interface TrustSignals {
  /** Mean client rating, 1..5 (0 if no reviews yet). */
  avgRating: number;
  reviewsCount: number;
  /** Orders delivered on or before deadline / total delivered. */
  ordersOnTime: number;
  ordersDelivered: number;
  /** Submissions that passed the AI gate on the first attempt / total. */
  aiFirstPass: number;
  aiSubmissions: number;
  /** Median first-response time to a new message, in hours. */
  medianResponseHours: number;
}

export interface TrustBreakdown {
  score: number; // 0..100, rounded to 1 dp
  tier: TrustTier;
  components: {
    label: string;
    /** Normalized sub-score 0..100. */
    value: number;
    /** Weight applied (0..1). */
    weight: number;
    /** Points this component contributes to the final score. */
    contribution: number;
    hint: string;
  }[];
}

/** A faster reply scores higher; <=2h is perfect, >=48h is zero. */
function responseSubScore(medianHours: number): number {
  if (medianHours <= 2) return 100;
  if (medianHours >= 48) return 0;
  // Linear decay between 2h and 48h.
  return Math.round(100 * (1 - (medianHours - 2) / 46));
}

function pct(part: number, whole: number, fallback = 0): number {
  if (whole <= 0) return fallback;
  return Math.min(100, (part / whole) * 100);
}

/** Map a 0..100 score to its tier using the published thresholds. */
export function tierForScore(score: number): TrustTier {
  // TRUST_TIERS is ascending by `min`; pick the highest tier we clear.
  const tiers = [...TRUST_TIERS].reverse();
  const match = tiers.find((t) => score >= t.min) ?? TRUST_TIERS[0];
  return match.name.toLowerCase() as TrustTier;
}

/** Compute the weighted trust score and a per-component breakdown. */
export function computeTrustScore(signals: TrustSignals): TrustBreakdown {
  const ratingSub = signals.reviewsCount > 0 ? (signals.avgRating / 5) * 100 : 0;
  const onTimeSub = pct(signals.ordersOnTime, signals.ordersDelivered);
  const aiSub = pct(signals.aiFirstPass, signals.aiSubmissions);
  const responseSub = responseSubScore(signals.medianResponseHours);

  const components = [
    {
      label: "Client ratings",
      value: round1(ratingSub),
      weight: TRUST_WEIGHTS.rating,
      contribution: round1(ratingSub * TRUST_WEIGHTS.rating),
      hint:
        signals.reviewsCount > 0
          ? `${signals.avgRating.toFixed(1)}/5 across ${signals.reviewsCount} reviews`
          : "No reviews yet",
    },
    {
      label: "On-time delivery",
      value: round1(onTimeSub),
      weight: TRUST_WEIGHTS.onTime,
      contribution: round1(onTimeSub * TRUST_WEIGHTS.onTime),
      hint: `${signals.ordersOnTime}/${signals.ordersDelivered} delivered on time`,
    },
    {
      label: "AI gate first-pass",
      value: round1(aiSub),
      weight: TRUST_WEIGHTS.aiPass,
      contribution: round1(aiSub * TRUST_WEIGHTS.aiPass),
      hint: `${signals.aiFirstPass}/${signals.aiSubmissions} passed on first attempt`,
    },
    {
      label: "Responsiveness",
      value: round1(responseSub),
      weight: TRUST_WEIGHTS.response,
      contribution: round1(responseSub * TRUST_WEIGHTS.response),
      hint: `~${signals.medianResponseHours}h median first reply`,
    },
  ];

  const score = round1(components.reduce((sum, c) => sum + c.contribution, 0));
  return { score, tier: tierForScore(score), components };
}

/** Max single-job budget a tier may accept (gating higher-value work). */
export const TIER_BUDGET_CEILING: Record<TrustTier, number> = {
  bronze: 5_000,
  silver: 15_000,
  gold: 50_000,
  platinum: Number.POSITIVE_INFINITY,
};

/** Whether a student at `tier` may bid on a job of `amount`. */
export function canAcceptBudget(tier: TrustTier, amount: number): boolean {
  return amount <= TIER_BUDGET_CEILING[tier];
}

/** Points and tier needed to reach the next tier (null if already top). */
export function nextTier(score: number): { name: string; min: number; pointsAway: number } | null {
  const higher = TRUST_TIERS.find((t) => t.min > score);
  if (!higher) return null;
  return { name: higher.name, min: higher.min, pointsAway: round1(higher.min - score) };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
