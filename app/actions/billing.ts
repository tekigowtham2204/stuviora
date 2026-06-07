"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/dal";
import { services } from "@/lib/env";
import { getServiceSupabase } from "@/lib/supabase/server";

/**
 * Update billing fields on a user profile (P2 student-audit #51).
 *
 * Clients: GSTIN persisted on `client_profiles.gstin`.
 * Students: GSTIN persisted on `student_profiles.gstin` (for the rare
 * student who has registered for GST). Both are optional.
 *
 * Live path validates GSTIN format with the 15-character pattern
 * (DD AAAAA 9999 X 1 Z X). Demo path no-ops and returns ?saved=1.
 */

const GSTIN_RE =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;

export async function saveBilling(formData: FormData) {
  const session = await requireSession();
  const gstinRaw = (formData.get("gstin") as string | null)?.trim() ?? "";
  const gstin = gstinRaw.toUpperCase();

  if (gstin && !GSTIN_RE.test(gstin)) {
    redirect("/settings?error=invalid_gstin");
  }

  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const table =
        session.user.role === "client" ? "client_profiles" : "student_profiles";
      const key = session.user.role === "client" ? "id" : "user_id";
      await supabase
        .from(table)
        .update({ gstin: gstin || null })
        .eq(key, session.user.id);
    }
  }

  revalidatePath("/settings");
  redirect("/settings?saved=1");
}

/**
 * Save UPI + bank for student payouts (P2 student-audit #53). Persists
 * to `student_wallets`. Bank account number is intended to be wrapped
 * in Supabase Vault encryption in P7; for now we store plaintext in
 * demo and let live wiring layer the encryption in.
 */
export async function savePayoutDetails(formData: FormData) {
  const session = await requireSession();
  if (session.user.role !== "student") {
    redirect("/settings?error=wrong_role");
  }

  const upi = ((formData.get("upi") as string | null) ?? "").trim();
  const ifsc = ((formData.get("ifsc") as string | null) ?? "").trim().toUpperCase();
  const accountNumber = ((formData.get("accountNumber") as string | null) ?? "").trim();

  if (upi && !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(upi)) {
    redirect("/student/payouts?error=invalid_upi");
  }
  if (ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
    redirect("/student/payouts?error=invalid_ifsc");
  }
  if (accountNumber && !/^[0-9]{9,18}$/.test(accountNumber)) {
    redirect("/student/payouts?error=invalid_account");
  }

  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase
        .from("student_wallets")
        .upsert(
          {
            student_id: session.user.id,
            upi_id: upi || null,
            bank_account_enc: accountNumber || null,
          },
          { onConflict: "student_id" }
        );
    }
  }

  revalidatePath("/student/payouts");
  redirect("/student/payouts?saved=1");
}
