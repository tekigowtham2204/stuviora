/**
 * University B2B API (M7.1 / P9.4).
 *
 * Read-only cohort endpoint for placement cells, authenticated by an
 * HMAC-SHA256 signature over the canonical request (X-Api-Key +
 * X-Stuviora-Signature, 5-minute timestamp window). Demo path returns
 * seeded cohort data; live path queries Supabase with the college filter.
 */

import { NextResponse } from "next/server";
import { requirePartner } from "@/lib/partners/guard";
import { rollupCohorts } from "@/lib/university/engine";
import * as demo from "@/lib/demo/data";

export async function GET(req: Request) {
  const auth = await requirePartner(req);
  if (!auth.ok) return auth.response;

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
