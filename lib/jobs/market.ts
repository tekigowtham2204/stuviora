/**
 * Job market signals (freelancer.com-style price discovery).
 *
 * The reference pattern: every job card shows "N bids, Rs.X avg bid" so
 * both sides see the market price forming. Complements our AI pricing
 * suggestion (model-driven) with the live market view (demand-driven).
 * Pure helpers; the data layer feeds proposals in.
 */

import type { Proposal } from "@/lib/types";

export interface MarketSignal {
  bids: number;
  avgBid: number | null;
}

/** Average bid + count for one job from its proposals. */
export function marketSignalFor(
  jobId: string,
  proposals: Proposal[]
): MarketSignal {
  const bids = proposals.filter((p) => p.jobId === jobId && p.bidAmount > 0);
  if (bids.length === 0) return { bids: 0, avgBid: null };
  const avg =
    bids.reduce((sum, p) => sum + p.bidAmount, 0) / bids.length;
  return { bids: bids.length, avgBid: Math.round(avg) };
}

/** Batch variant for list surfaces: jobId -> signal. */
export function marketSignals(
  jobIds: string[],
  proposals: Proposal[]
): Map<string, MarketSignal> {
  const out = new Map<string, MarketSignal>();
  for (const id of jobIds) out.set(id, marketSignalFor(id, proposals));
  return out;
}
