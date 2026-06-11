"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { requireRole } from "@/lib/auth/dal";
import { scopedPartner } from "@/lib/auth/university";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";
import { trackEvent } from "@/lib/observability";
/**
 * University partner Server Actions (P9 portal).
 *
 * All require the `university` role. Each one is scoped to the signed-in
 * partner's own credential (resolved from the session via scopedPartner),
 * so a partner can never act on another college. Writes use the service
 * role; demo mode skips persistence and just redirects.
 */

function newSecret(): string {
  return randomBytes(24).toString("hex");
}

function newInviteCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

function slugKey(college: string): string {
  const slug = college
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 24);
  return `${slug || "partner"}-${randomBytes(3).toString("hex")}`;
}

// --- Admin: issue / revoke partner credentials -----------------------------

export async function issuePartner(formData: FormData) {
  await requireRole("admin");
  const college = ((formData.get("college") as string) || "").trim();
  const partnerName =
    ((formData.get("partnerName") as string) || "").trim() ||
    `${college} Placement Cell`;
  if (!college) redirect("/admin/university?error=missing_college");

  const keyId = slugKey(college);
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase.from("university_partners").insert({
        key_id: keyId,
        secret: newSecret(),
        partner_name: partnerName,
        college,
        invite_code: newInviteCode(),
        active: true,
      });
    }
  }
  trackEvent("university_partner_issued", { keyId, college });
  redirect(`/admin/university?issued=${encodeURIComponent(keyId)}`);
}

export async function revokePartner(formData: FormData) {
  await requireRole("admin");
  const keyId = ((formData.get("keyId") as string) || "").trim();
  if (!keyId) redirect("/admin/university?error=missing_key");
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase
        .from("university_partners")
        .update({ active: false, revoked_at: new Date().toISOString() })
        .eq("key_id", keyId);
    }
  }
  trackEvent("university_partner_revoked", { keyId });
  redirect(`/admin/university?revoked=${encodeURIComponent(keyId)}`);
}

export async function rotateApiKey() {
  await requireRole("university");
  const partner = await scopedPartner();
  if (partner && services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase
        .from("university_partners")
        .update({ secret: newSecret() })
        .eq("key_id", partner.keyId);
    }
  }
  trackEvent("university_key_rotated", { keyId: partner?.keyId });
  redirect("/university/integration?rotated=1");
}

export async function regenerateInviteCode() {
  await requireRole("university");
  const partner = await scopedPartner();
  if (partner && services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase
        .from("university_partners")
        .update({ invite_code: newInviteCode() })
        .eq("key_id", partner.keyId);
    }
  }
  trackEvent("university_invite_regenerated", { keyId: partner?.keyId });
  redirect("/university/settings?invite=1");
}
