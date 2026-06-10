import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/dal";
import { authErrorResponse } from "@/lib/auth/route-guard";
import { getCohortForCollege } from "@/lib/data/queries";
import { scopedCollege } from "@/lib/auth/university";

/**
 * Cohort CSV for a university partner (P9). Role-gated to `university`
 * and scoped to the session's college (never a URL param), so a partner
 * can only export its own cohort. Aggregate figures only.
 */

export const dynamic = "force-dynamic";

function csvEscape(cell: string): string {
  if (/[",\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
}

export async function GET(req: NextRequest) {
  void req;
  try {
    await requireRole("university");
  } catch (e) {
    const res = authErrorResponse(e);
    if (res) return res;
    throw e;
  }

  const college = await scopedCollege();
  const cohort = await getCohortForCollege(college);

  const rows: string[][] = [["metric", "value"]];
  if (cohort) {
    const { row, categoryMix } = cohort;
    rows.push(["college", college]);
    rows.push(["students", String(row.students)]);
    rows.push(["activated", String(row.activated)]);
    rows.push(["activation_rate_pct", String(Math.round(row.activationRate * 100))]);
    rows.push(["total_earnings_inr", String(row.gmv)]);
    rows.push(["earnings_per_student_inr", String(row.gmvPerStudent)]);
    for (const c of categoryMix) {
      rows.push([`category:${c.category}`, String(c.count)]);
    }
  } else {
    rows.push(["college", college]);
    rows.push(["students", "0"]);
  }

  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const safe = college.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="stuviora-cohort-${safe}.csv"`,
      "cache-control": "no-store",
    },
  });
}
