import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/dal";
import { authErrorResponse } from "@/lib/auth/route-guard";
import {
  getStudentById,
  getClientById,
  listStudentOrders,
  listClientOrders,
  listStudentProposals,
  listPortfolio,
  listReviewsForStudent,
} from "@/lib/data/queries";
import {
  assembleDataExport,
  toExportJson,
  exportFilename,
  type DataExportInput,
} from "@/lib/privacy/export";

/**
 * DPDP "download my data" (right of access). Returns the signed-in user's
 * personal data as a JSON file. Demo: assembles from the seeded data for
 * the session persona; live: the same queries read Supabase.
 */

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  void req;
  let session;
  try {
    session = await requireSession();
  } catch (e) {
    const res = authErrorResponse(e);
    if (res) return res;
    throw e;
  }
  const { id, role, name } = session.user;

  const input: DataExportInput = { userId: id, role, name };

  if (role === "client") {
    const [profile, orders] = await Promise.all([
      getClientById(id),
      listClientOrders(id),
    ]);
    input.profile = (profile as unknown as Record<string, unknown>) ?? null;
    input.orders = orders;
  } else {
    const [profile, orders, proposals, portfolio, reviews] = await Promise.all([
      getStudentById(id),
      listStudentOrders(id),
      listStudentProposals(id),
      listPortfolio(id),
      listReviewsForStudent(id),
    ]);
    input.profile = (profile as unknown as Record<string, unknown>) ?? null;
    input.orders = orders;
    input.proposals = proposals;
    input.portfolio = portfolio;
    input.reviews = reviews;
  }

  const exportDoc = assembleDataExport(input);

  return new NextResponse(toExportJson(exportDoc), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${exportFilename(id)}"`,
      "cache-control": "no-store",
    },
  });
}
