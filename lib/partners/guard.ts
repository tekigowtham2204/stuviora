/**
 * Partner API route guard (P9.4).
 *
 * Wraps an incoming Request, resolves the partner by X-Api-Key, and
 * verifies the HMAC signature over the canonical request. Returns the
 * partner on success or a ready-to-return 401 NextResponse on failure.
 *
 * Headers expected:
 *   X-Api-Key            partner key id
 *   X-Stuviora-Timestamp epoch millis
 *   X-Stuviora-Nonce     unique per request (replay defence)
 *   X-Stuviora-Signature hex HMAC-SHA256 of the canonical string
 */

import "server-only";
import { NextResponse } from "next/server";
import { getPartnerByKey, type Partner } from "@/lib/partners/registry";
import { verifyRequest } from "@/lib/partners/hmac";
import { markNonceSeen } from "@/lib/partners/nonce-store";

export type PartnerAuth =
  | { ok: true; partner: Partner }
  | { ok: false; response: NextResponse };

function unauthorized(reason: string): { ok: false; response: NextResponse } {
  return {
    ok: false,
    response: NextResponse.json({ error: "unauthorized", reason }, { status: 401 }),
  };
}

export async function requirePartner(req: Request): Promise<PartnerAuth> {
  const keyId = req.headers.get("x-api-key") ?? "";
  const timestamp = req.headers.get("x-stuviora-timestamp") ?? "";
  const nonce = req.headers.get("x-stuviora-nonce") ?? "";
  const signature = req.headers.get("x-stuviora-signature") ?? "";

  if (!keyId || !timestamp || !signature) {
    return unauthorized("missing_auth_headers");
  }

  const partner = await getPartnerByKey(keyId);
  if (!partner) return unauthorized("unknown_key");

  // GET endpoints carry no body; read it for any future write endpoints.
  const body = req.method === "GET" || req.method === "HEAD" ? "" : await req.text();
  const path = new URL(req.url).pathname;

  const result = verifyRequest({
    secret: partner.secret,
    method: req.method,
    path,
    timestamp,
    nonce,
    body,
    signature,
  });

  if (!result.ok) return unauthorized(result.reason);

  // Replay defence: the signature is valid and the timestamp is fresh, so
  // reject a nonce we have already seen inside the skew window.
  if (markNonceSeen(keyId, nonce)) {
    return unauthorized("replayed_nonce");
  }

  return { ok: true, partner };
}
