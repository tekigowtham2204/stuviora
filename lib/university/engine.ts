/**
 * University B2B engine (M7.1).
 *
 * Pure cohort analytics over student users belonging to a college, plus
 * activation metrics (students who have completed at least one job).
 *
 * Used by:
 *  - app/(admin)/admin/university (founder view)
 *  - app/api/v1/university/* (public REST API for placement cells)
 */

import type { AdminUser, Order, StudentProfile } from "@/lib/types";

export interface CohortRow {
  college: string;
  students: number;
  activated: number;
  activationRate: number;
  gmv: number;
  gmvPerStudent: number;
}

export interface UniversitySummary {
  totalStudents: number;
  totalActivated: number;
  totalGmv: number;
  topColleges: CohortRow[];
}

/** Roll up by college. "Activated" = at least one completed order. */
export function rollupCohorts(
  students: StudentProfile[],
  adminUsers: AdminUser[],
  orders: Order[]
): UniversitySummary {
  const byCollege = new Map<string, CohortRow>();
  for (const s of students) {
    const row = byCollege.get(s.college) ?? {
      college: s.college,
      students: 0,
      activated: 0,
      activationRate: 0,
      gmv: 0,
      gmvPerStudent: 0,
    };
    row.students += 1;
    const completed = orders.filter(
      (o) => o.studentId === s.id && o.status === "completed"
    );
    if (completed.length > 0) row.activated += 1;
    row.gmv += orders
      .filter((o) => o.studentId === s.id && o.status === "completed")
      .reduce((sum, o) => sum + o.amount, 0);
    byCollege.set(s.college, row);
  }
  // Fold in admin-users gmv for richer demo numbers.
  for (const a of adminUsers) {
    if (a.role !== "student") continue;
    const student = students.find((s) => s.id === a.id);
    if (!student) continue;
    const row = byCollege.get(student.college)!;
    row.gmv = Math.max(row.gmv, a.gmv);
  }
  const cohorts = Array.from(byCollege.values()).map((row) => ({
    ...row,
    activationRate: row.students === 0 ? 0 : row.activated / row.students,
    gmvPerStudent: row.students === 0 ? 0 : Math.round(row.gmv / row.students),
  }));
  cohorts.sort((a, b) => b.gmv - a.gmv);

  return {
    totalStudents: students.length,
    totalActivated: cohorts.reduce((s, c) => s + c.activated, 0),
    totalGmv: cohorts.reduce((s, c) => s + c.gmv, 0),
    topColleges: cohorts,
  };
}
