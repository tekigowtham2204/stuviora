"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/dal";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";
import { trackEvent } from "@/lib/observability";
import {
  buildConsentRecord,
  type ConsentState,
} from "@/lib/privacy/consent";

/**
 * DPDP privacy Server Actions (P7).
 *
 * All require an authenticated session (DAL). Writes use the service-role
 * client (consent_log + account_deletion_requests are service-role only,
 * per migration 0006). Demo mode skips persistence so the flows are
 * clickable without a database.
 */

export async function recordConsent(
  choices: Partial<ConsentState>,
  source: "banner" | "settings" | "signup" = "settings"
): Promise<{ ok: boolean }> {
  const session = await requireSession();
  const record = buildConsentRecord(session.user.id, choices);

  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase.from("consent_log").insert({
        user_id: record.userId,
        state: record.state,
        notice_version: record.noticeVersion,
        source,
      });
    }
  }
  trackEvent("consent_recorded", { source }, session.user.id);
  revalidatePath("/data-privacy");
  return { ok: true };
}

export async function requestAccountDeletion(formData: FormData) {
  const session = await requireSession();
  const reason = ((formData.get("reason") as string) || "").trim() || null;

  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      // The unique partial index keeps this idempotent per active request.
      await supabase
        .from("account_deletion_requests")
        .insert({ user_id: session.user.id, reason });
    }
  }
  trackEvent("account_deletion_requested", {}, session.user.id);
  redirect("/data-privacy?deletion=requested");
}

export async function cancelAccountDeletion() {
  const session = await requireSession();
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase
        .from("account_deletion_requests")
        .update({ status: "cancelled" })
        .eq("user_id", session.user.id)
        .eq("status", "requested");
    }
  }
  trackEvent("account_deletion_cancelled", {}, session.user.id);
  redirect("/data-privacy?deletion=cancelled");
}
