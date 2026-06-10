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
