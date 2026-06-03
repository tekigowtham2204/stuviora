/** Small time helpers shared by the dispute + escrow countdowns. */

/** Whole hours remaining until an ISO deadline; null if no deadline, 0 if past. */
export function hoursLeft(deadlineISO: string | null, now = new Date()): number | null {
  if (!deadlineISO) return null;
  const ms = new Date(deadlineISO).getTime() - now.getTime();
  return Math.max(0, Math.round(ms / 3600_000));
}
