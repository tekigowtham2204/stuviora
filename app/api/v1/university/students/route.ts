/**
 * University B2B API (M7.1).
 *
 * Public read-only endpoint for placement cells, signed by HMAC of the
 * API key. Demo path returns seeded cohort data; live path queries
 * Supabase with the college filter.
 *
 * Authentication (TODO live):
 *   - Read X-Api-Key header
 *   - Verify HMAC SHA-256 of body+timestamp using the partner's secret
 *   - Reject if timestamp drift > 5 minutes
 */

import { NextResponse } from "next/server";
import { rollupCohorts } from "@/lib/university/engine";
import * as demo from "@/lib/demo/data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const college = searchParams.get("college");

  const summary = rollupCohorts(demo.students, demo.adminUsers, demo.orders);
  const cohorts = college
    ? summary.topColleges.filter(
        (c) => c.college.toLowerCase() === college.toLowerCase()
      )
    : summary.topColleges;

  return NextResponse.json({
    cohorts,
    totalStudents: summary.totalStudents,
    totalActivated: summary.totalActivated,
    totalGmv: summary.totalGmv,
    asOf: new Date().toISOString(),
  });
}
