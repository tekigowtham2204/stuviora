import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/dal";
import { authErrorResponse } from "@/lib/auth/route-guard";
import { wallet } from "@/lib/demo/data";

/**
 * Wallet transaction history as CSV (features.md: "exportable to CSV").
 * Demo: the seeded wallet rows; live: SELECT from the ledger for the
 * session student.
 */
export const dynamic = "force-dynamic";

function csvEscape(cell: string): string {
  if (/[",\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
}

export async function GET(req: NextRequest) {
  void req;
  try {
    await requireSession();
  } catch (e) {
    const res = authErrorResponse(e);
    if (res) return res;
    throw e;
  }

  const header = ["date", "description", "amount_inr", "status"];
  const rows = wallet.transactions.map((t) => [
    t.date,
    t.description,
    String(t.amount),
    t.status,
  ]);
  const csv = [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="stuviora-transactions.csv"',
      "cache-control": "no-store",
    },
  });
}
