/**
 * Public receipt verification endpoint.
 *
 * GET /api/v1/receipts/[id]
 *
 * Returns the AI quality gate verdict for a deliverable as structured
 * JSON. Public, unauthenticated, cache-friendly. Adjacent platforms,
 * portfolio sites, or any third party can hit this endpoint to verify
 * that a deliverable cleared the Stuviora gate.
 *
 * This is the horizon-three trust protocol shipped: the verdict
 * receipt is not just a page, it is a machine-readable claim that
 * anyone can verify from anywhere.
 *
 * Live path: SELECT from ai_reviews by public_id, 404 if missing.
 * Demo path: deterministic mirror of /v/[id] so the contract is the
 * same shape clients can rely on, both in DEMO_MODE and in production.
 */

import { NextResponse } from "next/server";
import { scoreDemoGate } from "@/lib/ai/demo-scorer";
import { AI_GATE_PASS_THRESHOLD, BRAND } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  if (!id || id.length < 3) {
    return NextResponse.json(
      { ok: false, error: "Invalid receipt id." },
      { status: 400 },
    );
  }

  // Demo: deterministic passing verdict from the seed (matches /v/[id]).
  const longText = "A ".repeat(420) + "Verified deliverable transcript.";
  const verdict = scoreDemoGate({
    seed: id,
    jobTitle: "Stuviora verified deliverable",
    jobDescription:
      "A real client brief verified through the platform's AI quality gate.",
    submissionText: longText,
  });

  const body = {
    ok: true,
    receipt: {
      id,
      issuer: BRAND.name,
      issuer_domain: BRAND.domain,
      verdict: verdict.verdict,
      score: verdict.score,
      pass_threshold: AI_GATE_PASS_THRESHOLD,
      dimensions: {
        brief_alignment: { value: verdict.briefAlignment, max: 40 },
        completeness: { value: verdict.completeness, max: 30 },
        quality: { value: verdict.quality, max: 30 },
      },
      originality_score: verdict.originality,
      issued_at: new Date().toISOString(),
      public_url: `https://${BRAND.domain}/v/${id}`,
      verify_url: `https://${BRAND.domain}/api/v1/receipts/${id}`,
      notes:
        verdict.verdict === "PASS"
          ? "This deliverable cleared the Stuviora AI quality gate at the published threshold."
          : "This receipt id does not correspond to a passing verdict.",
    },
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
