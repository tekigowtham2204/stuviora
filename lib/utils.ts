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

/** Stuviora 85/15 split math, with 18% GST on the platform commission. */
export function computeSplit(jobAmount: number, commissionRate = 0.15) {
  const commission = Math.round(jobAmount * commissionRate);
  const studentPayout = jobAmount - commission;
  const gst = Math.round(commission * 0.18);
  const platformNet = commission - gst;
  return { jobAmount, commission, studentPayout, gst, platformNet };
}
