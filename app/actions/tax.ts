"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Tax / KYC Server Actions.
 *
 * Live path: validate PAN format, encrypt with Supabase Vault, store in
 * student_profiles.pan_encrypted. PAN is required before any TDS can be
 * withheld compliantly (Sec. 194H).
 */

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export async function savePan(formData: FormData) {
  const pan = ((formData.get("pan") as string) || "").toUpperCase().trim();
  const valid = PAN_RE.test(pan);

  // Live: if valid, encrypt + persist; else return a field error.
  revalidatePath("/student/tax");
  redirect(`/student/tax?pan=${valid ? "saved" : "invalid"}`);
}
