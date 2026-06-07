import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/dal";
import { authErrorResponse } from "@/lib/auth/route-guard";
import { financialYear } from "@/lib/tax/engine";

/**
 * CSV export of a student's tax events for the current FY
 * (student-audit #50). Demo: returns the same 3 FY rows the
 * /student/tax page renders; live: SELECT FROM tax_events WHERE
 * student_id = ? AND created_at >= fy_start.
 *
 * Response is text/csv with a Content-Disposition so the browser
 * downloads instead of rendering.
 */

const DEMO_ROWS = [
  { order: "SV-1021", studentGross: 4250, tdsWithheld: 212.5, settledAt: "2026-05-15" },
  { order: "SV-0998", studentGross: 6800, tdsWithheld: 340, settledAt: "2026-04-22" },
  { order: "SV-0942", studentGross: 3200, tdsWithheld: 160, settledAt: "2026-03-30" },
];

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  void req;
  // Unauthenticated requests get a clean 401 rather than an unhandled 500.
  try {
    await requireSession();
  } catch (e) {
    const res = authErrorResponse(e);
    if (res) return res;
    throw e;
  }
  const fy = financialYear();

  const header = [
    "order_id",
    "settled_at",
    "student_gross_inr",
    "tds_withheld_inr",
    "student_net_inr",
  ];
  const rows = DEMO_ROWS.map((r) => [
    r.order,
    r.settledAt,
    r.studentGross.toString(),
    r.tdsWithheld.toString(),
    (r.studentGross - r.tdsWithheld).toString(),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="stuviora-tax-${fy}.csv"`,
      "cache-control": "no-store",
    },
  });
}

function csvEscape(cell: string): string {
  if (/[",\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
}
