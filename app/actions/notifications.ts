"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { PREF_KEYS, type PrefKey } from "@/lib/notifications/preferences";

/**
 * Persist notification preferences from the settings page form.
 *
 * Demo: no-op (returns the latest values via the next request render).
 * Live: upsert into `notification_preferences` via Supabase.
 */
export async function saveNotificationPreferences(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  // Read submitted toggle states. Unchecked checkboxes don't post a value.
  const _patch: Partial<Record<PrefKey, boolean>> = {};
  for (const k of PREF_KEYS) {
    _patch[k] = formData.get(k) === "on";
  }
  // void: demo no-op; live wires here.
  void _patch;

  // Live path (TODO):
  //   const supabase = await createServerClient();
  //   await supabase.from("notification_preferences").upsert({ user_id: session.id, ..._patch });

  revalidatePath("/settings");
  redirect("/settings?saved=1");
}
