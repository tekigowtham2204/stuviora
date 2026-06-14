import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Indian Rupees (₹1,23,456). */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Stuviora 85/15 split math, with 18% GST on the platform commission.
 *
 * Rounds to paise (2 dp), matching lib/tax/engine.ts computeOrderTax so the
 * payout ledger (lib/razorpay/escrow.ts), the reconciler
 * (lib/payments/reconcile.ts), and the tax records never disagree on the
 * commission/student split. Razorpay settles in paise, so whole-rupee
 * rounding here would drift from the booked tax amounts.
 */
export function computeSplit(jobAmount: number, commissionRate = 0.15) {
  const commission = round2(jobAmount * commissionRate);
  const studentPayout = round2(jobAmount - commission);
  const gst = round2(commission * 0.18);
  const platformNet = round2(commission - gst);
  return { jobAmount, commission, studentPayout, gst, platformNet };
}

/** Round to 2 decimals (paise). */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
