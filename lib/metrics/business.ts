import { COMMISSION_RATE, COST_ASSUMPTIONS } from "@/lib/constants";

/**
 * Unit-economics engine for the founder/investor dashboard.
 *
 * Pure functions only: every figure is computed from rows the caller passes
 * in, so the same fold serves the live (Supabase) and demo paths and stays
 * fully testable. Measured metrics return null when there is not enough data
 * to compute them honestly, rather than a misleading zero. The one MODELED
 * figure (contribution margin) is built from clearly-named cost assumptions
 * the dashboard prints inline.
 */

/** One client's completed-order tally, derived from orders. */
export interface ClientOrderRow {
  clientId: string;
  /** True once the order is completed (counts toward repeat behaviour). */
  completed: boolean;
}

/**
 * Repeat-client rate: of the clients who completed at least one order, the
 * fraction who completed two or more. Null when no client has completed an
 * order yet. This is the demand-retention signal investors ask for first.
 */
export function repeatClientRate(rows: ClientOrderRow[]): number | null {
  const counts = new Map<string, number>();
  for (const r of rows) {
    if (r.completed) counts.set(r.clientId, (counts.get(r.clientId) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  let repeat = 0;
  for (const n of counts.values()) if (n >= 2) repeat += 1;
  return repeat / counts.size;
}

/** Take rate: net platform revenue as a share of GMV. Null when GMV is zero. */
export function takeRate(gmv: number, revenueNet: number): number | null {
  return gmv > 0 ? revenueNet / gmv : null;
}

/** Median of a list of day-counts (e.g. signup to first order). Null if empty. */
export function medianDays(days: number[]): number | null {
  if (days.length === 0) return null;
  const sorted = [...days].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export interface ContributionMargin {
  /** Commission earned on an average-value order. */
  revenuePerOrder: number;
  /** Modeled variable cost to serve that order. */
  variableCostPerOrder: number;
  /** revenuePerOrder - variableCostPerOrder. */
  marginPerOrder: number;
  /** Margin as a share of revenue. Null when there is no revenue. */
  marginRate: number | null;
}

/**
 * MODELED contribution margin for an average order. Revenue is the real
 * commission rate; variable cost uses the stated COST_ASSUMPTIONS. The
 * dashboard must label this as modeled and show the assumptions.
 */
export function modelContributionMargin(
  avgOrderValue: number,
  costs = COST_ASSUMPTIONS,
  commissionRate = COMMISSION_RATE
): ContributionMargin {
  const revenuePerOrder = avgOrderValue * commissionRate;
  const variableCostPerOrder =
    avgOrderValue * costs.paymentProcessingRate +
    costs.gateCostPerOrder +
    costs.payoutFeePerOrder;
  const marginPerOrder = revenuePerOrder - variableCostPerOrder;
  return {
    revenuePerOrder,
    variableCostPerOrder,
    marginPerOrder,
    marginRate: revenuePerOrder > 0 ? marginPerOrder / revenuePerOrder : null,
  };
}

export interface BusinessMetrics {
  /** Measured. */
  repeatClientRate: number | null;
  takeRate: number | null;
  medianDaysToFirstOrder: number | null;
  gatePrecision: number | null;
  /** Modeled. */
  contributionMargin: ContributionMargin;
  /** Average order value used to model the margin (real, from GMV / count). */
  avgOrderValue: number;
}

export interface BusinessMetricsInput {
  gmv: number;
  revenueNet: number;
  completedOrderCount: number;
  clientOrders: ClientOrderRow[];
  daysToFirstOrder: number[];
  gatePrecision: number | null;
}

/** Assemble the dashboard bundle from already-fetched rows. */
export function computeBusinessMetrics(
  input: BusinessMetricsInput
): BusinessMetrics {
  const avgOrderValue =
    input.completedOrderCount > 0 ? input.gmv / input.completedOrderCount : 0;
  return {
    repeatClientRate: repeatClientRate(input.clientOrders),
    takeRate: takeRate(input.gmv, input.revenueNet),
    medianDaysToFirstOrder: medianDays(input.daysToFirstOrder),
    gatePrecision: input.gatePrecision,
    contributionMargin: modelContributionMargin(avgOrderValue),
    avgOrderValue,
  };
}
