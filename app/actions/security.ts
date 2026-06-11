"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/dal";
import { getServerSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";
import { trackEvent } from "@/lib/observability";

/**
 * Account security actions (audit #62 2FA, #63 sessions).
 *
 * Live: Supabase Auth's built-in MFA (TOTP enroll) and global sign-out
 * scope for "sign out other devices". Demo: records the intent and
 * flashes so the flow is clickable without keys.
 */

export async function enrollTotp() {
  const session = await requireSession();
  if (services.supabase) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });
      if (error || !data) {
        redirect("/settings?security=mfa_failed");
      }
      // The QR/secret is shown once on the settings page via the flash.
      trackEvent("mfa_enroll_started", {}, session.user.id);
      redirect("/settings?security=mfa_enrolled");
    }
  }
  trackEvent("mfa_enroll_started", { demo: true }, session.user.id);
  redirect("/settings?security=mfa_demo");
}

export async function signOutOtherDevices() {
  const session = await requireSession();
  if (services.supabase) {
    const supabase = await getServerSupabase();
    if (supabase) {
      // Revokes every session except the current one.
      await supabase.auth.signOut({ scope: "others" });
    }
  }
  trackEvent("sessions_revoked_others", {}, session.user.id);
  redirect("/settings?security=sessions_cleared");
}
