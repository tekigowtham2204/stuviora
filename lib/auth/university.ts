import "server-only";
import { getSession } from "@/lib/auth/session";
import { DEMO_UNIVERSITY } from "@/lib/demo/data";
import { getPartnerByKey, type Partner } from "@/lib/partners/registry";

/**
 * The college a signed-in university partner is scoped to. Every
 * university page, action, and report must derive the college from here
 * (the session), never from a URL param, so a partner can only ever see
 * its own college's cohort. Demo falls back to the demo partner's college
 * so the portal is clickable without logging in.
 */
export async function scopedCollege(): Promise<string> {
  const session = await getSession();
  if (session?.role === "university" && session.college) return session.college;
  return DEMO_UNIVERSITY.college;
}

/**
 * The partner credential for the signed-in university. Live mode resolves
 * via university_members (session user id -> key_id); demo uses the
 * well-known demo partner. The caller must never expose `secret` in the UI.
 */
export async function scopedPartner(): Promise<Partner | null> {
  return getPartnerByKey(DEMO_UNIVERSITY.keyId);
}
