"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Demo Server Actions for jobs + proposals.
 * In live mode these will write to Supabase via service-role for the relevant tables.
 * For now they revalidate and redirect so the UX feels real.
 */

export async function postJob(formData: FormData) {
  const title = (formData.get("title") as string)?.trim() || "Untitled job";
  // In live mode: insert into `jobs` with the client_id from session.
  void title;
  revalidatePath("/client/jobs");
  revalidatePath("/client/dashboard");
  redirect("/client/jobs");
}

export async function submitProposal(formData: FormData) {
  const jobId = (formData.get("jobId") as string) || "";
  void formData.get("coverLetter");
  void formData.get("bidAmount");
  void formData.get("deliveryDays");
  revalidatePath(`/student/jobs/${jobId}`);
  revalidatePath("/student/proposals");
  redirect("/student/proposals");
}

export async function hireProposal(formData: FormData) {
  const jobId = (formData.get("jobId") as string) || "";
  const proposalId = (formData.get("proposalId") as string) || "";
  void proposalId;
  revalidatePath(`/client/jobs/${jobId}/proposals`);
  // In live mode: create order in `pending_payment`, then redirect to payment page.
  redirect(`/client/payment/${proposalId || "demo"}`);
}
