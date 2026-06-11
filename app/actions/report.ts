"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/dal";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";
import { trackEvent } from "@/lib/observability";
import { userReports } from "@/lib/demo/state";

/**
 * Report a user (audit #61, P0 trust + safety). Routes to the admin
 * queue (admin_reports, migration 0012). Demo records in-memory so the
 * flow is fully clickable.
 */
export async function reportUser(formData: FormData) {
  const session = await requireSession();
  const targetName = ((formData.get("targetName") as string) || "").trim();
  const context = ((formData.get("context") as string) || "profile").trim();
  const reason = ((formData.get("reason") as string) || "").trim();
  const returnTo = ((formData.get("returnTo") as string) || "/").trim();

  if (!targetName || reason.length < 10) {
    redirect(`${returnTo}?report=invalid`);
  }

  if (services.supabase) {
    const supabase = getServiceSupabase();
    await supabase?.from("admin_reports").insert({
      reporter_id: session.user.id,
      target_name: targetName,
      context,
      reason,
    });
  } else {
    userReports.unshift({
      id: `rep-${Date.now()}`,
      reporterId: session.user.id,
      targetName,
      context,
      reason,
      createdAt: Date.now(),
    });
  }

  trackEvent("user_reported", { context }, session.user.id);
  redirect(`${returnTo}?report=filed`);
}
