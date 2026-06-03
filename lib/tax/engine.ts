/**
 * Tax engine (M4) — India compliance on top of the 85/15 split.
 *
 * Two taxes apply to a completed order:
 *
 *  1. GST @ 18% on Stuviora's commission (we are the supplier of the
 *     marketplace service). Charged on the 15% fee, not the job value.
 *
 *  2. TDS @ 5% under Section 194H (commission/brokerage), withheld from the
 *     student's payout, but ONLY once their cumulative gross for the financial
 *     year crosses the Rs.30,000 threshold. Below that, no TDS is withheld.
 *
 * Outputs feed `tax_events`, the GST invoice on each order, and the Form 16A
 * (TDS certificate) a student downloads at year end. PAN is required before
 * any TDS is withheld and is stored encrypted (pan_encrypted, Supabase Vault).
 */

export const GST_RATE = 0.18; // on commission
export const TDS_RATE = 0.05; // Section 194H
export const TDS_THRESHOLD = 30_000; // per financial year, per student
export const COMMISSION_RATE = 0.15;

export interface OrderTax {
  jobAmount: number;
  commission: number; // 15% platform fee
  gstOnCommission: number; // 18% of commission
  /** Commission inclusive of GST — what the ledger books as revenue in. */
  commissionWithGst: number;
  studentGross: number; // 85% before TDS
  tdsWithheld: number; // 5% once over threshold, else 0
  studentNet: number; // what actually lands in the wallet
  tdsApplied: boolean;
}

/**
 * Compute taxes for one order.
 * `priorFyGross` is the student's cumulative gross earnings this financial
 * year *before* this order, used to decide whether the Rs.30k TDS threshold
 * is crossed. `hasPan` gates TDS: without a PAN on file we cannot withhold
 * compliantly, so the order is blocked upstream rather than mis-withheld.
 */
export function computeOrderTax(
  jobAmount: number,
  priorFyGross = 0,
  commissionRate = COMMISSION_RATE,
): OrderTax {
  const commission = round2(jobAmount * commissionRate);
  const gstOnCommission = round2(commission * GST_RATE);
  const studentGross = round2(jobAmount - commission);

  const crossesThreshold = priorFyGross + studentGross > TDS_THRESHOLD;
  const tdsWithheld = crossesThreshold ? round2(studentGross * TDS_RATE) : 0;

  return {
    jobAmount,
    commission,
    gstOnCommission,
    commissionWithGst: round2(commission + gstOnCommission),
    studentGross,
    tdsWithheld,
    studentNet: round2(studentGross - tdsWithheld),
    tdsApplied: crossesThreshold,
  };
}

/** Indian financial year label for a date, e.g. "2026-27" (Apr 1 - Mar 31). */
export function financialYear(date = new Date()): string {
  const y = date.getFullYear();
  const startYear = date.getMonth() >= 3 ? y : y - 1; // April = month 3
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

export interface Form16AData {
  studentName: string;
  panMasked: string;
  financialYear: string;
  totalGross: number;
  totalTdsWithheld: number;
  ordersCount: number;
  deductorTan: string;
}

/** Aggregate a year's tax events into a Form 16A (TDS certificate) summary. */
export function buildForm16A(input: {
  studentName: string;
  panMasked: string;
  financialYear?: string;
  events: { studentGross: number; tdsWithheld: number }[];
  deductorTan?: string;
}): Form16AData {
  return {
    studentName: input.studentName,
    panMasked: input.panMasked,
    financialYear: input.financialYear ?? financialYear(),
    totalGross: round2(input.events.reduce((s, e) => s + e.studentGross, 0)),
    totalTdsWithheld: round2(input.events.reduce((s, e) => s + e.tdsWithheld, 0)),
    ordersCount: input.events.length,
    deductorTan: input.deductorTan ?? "BLRS00000F",
  };
}

/** Mask a PAN for display: ABCDE1234F -> ABCxxxx34F. */
export function maskPan(pan: string): string {
  if (pan.length !== 10) return "xxxxxxxxxx";
  return `${pan.slice(0, 3)}xxxx${pan.slice(7)}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
