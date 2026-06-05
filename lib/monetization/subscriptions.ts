/**
 * Client subscription tiers (M7.2).
 *
 * For volume-hiring clients. Subscriptions reduce commission rate and unlock
 * higher-trust talent filters. Pure tier definition + lookup; live path
 * persists active tier on `client_subscriptions` and charges monthly via
 * Razorpay Subscriptions.
 */

export type ClientPlan = "free" | "growth" | "scale";

export interface ClientPlanDef {
  id: ClientPlan;
  name: string;
  monthlyRupees: number;
  /** Override commission rate; falls back to platform default if undefined. */
  commissionRate?: number;
  /** Number of featured posts included per month. */
  featuredJobsIncluded: number;
  /** Maximum concurrent open jobs. */
  concurrentJobs: number;
  /** True = priority dispute queue. */
  prioritySupport: boolean;
  /** True = can filter only gold+ students at search-time. */
  premiumFilters: boolean;
}

export const CLIENT_PLANS: ClientPlanDef[] = [
  {
    id: "free",
    name: "Free",
    monthlyRupees: 0,
    featuredJobsIncluded: 0,
    concurrentJobs: 3,
    prioritySupport: false,
    premiumFilters: false,
  },
  {
    id: "growth",
    name: "Growth",
    monthlyRupees: 1999,
    commissionRate: 0.12,
    featuredJobsIncluded: 2,
    concurrentJobs: 10,
    prioritySupport: false,
    premiumFilters: true,
  },
  {
    id: "scale",
    name: "Scale",
    monthlyRupees: 4999,
    commissionRate: 0.1,
    featuredJobsIncluded: 6,
    concurrentJobs: 30,
    prioritySupport: true,
    premiumFilters: true,
  },
];

export function getPlan(id: ClientPlan): ClientPlanDef {
  return CLIENT_PLANS.find((p) => p.id === id) ?? CLIENT_PLANS[0];
}
