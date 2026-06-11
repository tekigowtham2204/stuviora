/**
 * Cohort roster helpers (P9 university portal).
 *
 * Pure functions that build the privacy-respecting student roster a
 * placement cell sees. Only students who opted in (consent purpose
 * `share_with_college`) appear individually, and their earnings are
 * shown as a band, never an exact figure. Everyone else stays in the
 * aggregate cohort numbers only.
 */

import type { StudentProfile } from "@/lib/types";

export interface RosterEntry {
  username: string;
  name: string;
  activated: boolean;
  earningsBand: string;
}

/** Coarse earnings band so the college never sees an exact rupee figure. */
export function earningsBand(earned: number): string {
  if (earned <= 0) return "No earnings yet";
  if (earned < 5_000) return "Under Rs.5,000";
  if (earned < 20_000) return "Rs.5,000 to Rs.20,000";
  if (earned < 50_000) return "Rs.20,000 to Rs.50,000";
  return "Rs.50,000+";
}

/**
 * Build the roster for one college's opted-in students.
 *
 * @param students   students already filtered to the college
 * @param consented  set of student ids who opted in to share_with_college
 * @param earnedById maps student id to lifetime completed earnings
 */
export function buildRoster(
  students: StudentProfile[],
  consented: Set<string>,
  earnedById: (studentId: string) => number
): RosterEntry[] {
  return students
    .filter((s) => consented.has(s.id))
    .map((s) => {
      const earned = earnedById(s.id);
      return {
        username: s.username,
        name: s.fullName,
        activated: earned > 0,
        earningsBand: earningsBand(earned),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
