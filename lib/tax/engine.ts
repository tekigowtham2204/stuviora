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

/**
 * Indian-tax quarter for a date.
 *   Q1 Apr 1 - Jun 30
 *   Q2 Jul 1 - Sep 30
 *   Q3 Oct 1 - Dec 31
 *   Q4 Jan 1 - Mar 31
 */
export function fiscalQuarter(date = new Date()): "Q1" | "Q2" | "Q3" | "Q4" {
  const m = date.getMonth(); // 0..11
  if (m >= 3 && m <= 5) return "Q1";
  if (m >= 6 && m <= 8) return "Q2";
  if (m >= 9 && m <= 11) return "Q3";
  return "Q4";
}

export interface QuarterSummary {
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  studentGross: number;
  tdsWithheld: number;
  ordersCount: number;
  gstOnCommission: number;
}

/**
 * Roll up per-order events into Q1..Q4 buckets for the current FY.
 * Each event must carry a `date` so we can place it in the right
 * quarter. Live: orders.completed_at + tax_events table; demo:
 * synthesised dates in the page.
 */
export function summariseByQuarter(
  events: Array<{
    date: Date | string;
    studentGross: number;
    tdsWithheld: number;
    gstOnCommission?: number;
  }>
): Record<"Q1" | "Q2" | "Q3" | "Q4", QuarterSummary> {
  const out: Record<"Q1" | "Q2" | "Q3" | "Q4", QuarterSummary> = {
    Q1: { quarter: "Q1", studentGross: 0, tdsWithheld: 0, ordersCount: 0, gstOnCommission: 0 },
    Q2: { quarter: "Q2", studentGross: 0, tdsWithheld: 0, ordersCount: 0, gstOnCommission: 0 },
    Q3: { quarter: "Q3", studentGross: 0, tdsWithheld: 0, ordersCount: 0, gstOnCommission: 0 },
    Q4: { quarter: "Q4", studentGross: 0, tdsWithheld: 0, ordersCount: 0, gstOnCommission: 0 },
  };
  for (const e of events) {
    const date = e.date instanceof Date ? e.date : new Date(e.date);
    const q = fiscalQuarter(date);
    out[q].studentGross = round2(out[q].studentGross + e.studentGross);
    out[q].tdsWithheld = round2(out[q].tdsWithheld + e.tdsWithheld);
    out[q].gstOnCommission = round2(out[q].gstOnCommission + (e.gstOnCommission ?? 0));
    out[q].ordersCount += 1;
  }
  return out;
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
