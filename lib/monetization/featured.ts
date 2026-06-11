/**
 * Featured listings (M7.2).
 *
 * Pure pricing + lifecycle helpers for paid promotion of jobs/services.
 * Live path charges via Razorpay Route (additional line item on the
 * platform account); demo path returns the computed line item.
 */

export type FeaturedKind = "job" | "service" | "profile";

export interface FeaturedPlan {
  kind: FeaturedKind;
  days: number;
  /** Price in paise (Razorpay convention). */
  amountPaise: number;
  /** Price in rupees (display). */
  amountRupees: number;
  label: string;
}

const TABLE: Record<FeaturedKind, FeaturedPlan[]> = {
  job: [
    { kind: "job", days: 3, amountPaise: 49900, amountRupees: 499, label: "Featured for 3 days" },
    { kind: "job", days: 7, amountPaise: 99900, amountRupees: 999, label: "Featured for 7 days" },
  ],
  service: [
    { kind: "service", days: 7, amountPaise: 79900, amountRupees: 799, label: "Featured for 7 days" },
    { kind: "service", days: 30, amountPaise: 249900, amountRupees: 2499, label: "Featured for 30 days" },
  ],
  profile: [
    { kind: "profile", days: 14, amountPaise: 149900, amountRupees: 1499, label: "Featured for 2 weeks" },
  ],
};

export function listFeaturedPlans(kind: FeaturedKind): FeaturedPlan[] {
  return TABLE[kind];
}

export function expiryFor(plan: FeaturedPlan, startMs = Date.now()): number {
  return startMs + plan.days * 86400_000;
}

export function planForDays(kind: FeaturedKind, days: number): FeaturedPlan | null {
  return TABLE[kind].find((p) => p.days === days) ?? null;
}

/** True while a featuredUntil timestamp is in the future. */
export function isFeaturedActive(
  featuredUntil: number | undefined,
  nowMs = Date.now()
): boolean {
  return typeof featuredUntil === "number" && featuredUntil > nowMs;
}

/** Stable sort: active-featured jobs first, original order otherwise. */
export function sortFeaturedFirst<T extends { featuredUntil?: number }>(
  items: T[],
  nowMs = Date.now()
): T[] {
  return [...items].sort(
    (a, b) =>
      Number(isFeaturedActive(b.featuredUntil, nowMs)) -
      Number(isFeaturedActive(a.featuredUntil, nowMs))
  );
}
