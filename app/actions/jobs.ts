"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { maybeSession } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/ratelimit";
import { trackEvent } from "@/lib/observability";

/**
 * Demo Server Actions for jobs + proposals.
 * In live mode these will write to Supabase via service-role for the relevant tables.
 * For now they revalidate and redirect so the UX feels real.
 *
 * P6: abuse-prone actions are rate limited (Upstash live, in-memory demo)
 * and emit funnel events via the observability facade.
 */

export async function postJob(formData: FormData) {
  const session = await maybeSession();
  const limit = await rateLimit({
    key: `postJob:${session?.user.id ?? "anon"}`,
    max: 10,
    windowMs: 60_000,
  });
  if (!limit.allowed) redirect("/client/post-job?error=rate_limited");

  const title = (formData.get("title") as string)?.trim() || "Untitled job";
  // In live mode: insert into `jobs` with the client_id from session.
  void title;
  trackEvent("job_posted", { hasTitle: Boolean(title) }, session?.user.id);
  revalidatePath("/client/jobs");
  revalidatePath("/client/dashboard");
  redirect("/client/jobs");
}

export async function submitProposal(formData: FormData) {
  const session = await maybeSession();
  const jobId = (formData.get("jobId") as string) || "";
  const limit = await rateLimit({
    key: `submitProposal:${session?.user.id ?? "anon"}`,
    max: 8,
    windowMs: 60_000,
  });
  if (!limit.allowed) redirect(`/student/jobs/${jobId}?error=rate_limited`);

  void formData.get("coverLetter");
  void formData.get("bidAmount");
  void formData.get("deliveryDays");
  trackEvent("proposal_submitted", { jobId }, session?.user.id);
  revalidatePath(`/student/jobs/${jobId}`);
  revalidatePath("/student/proposals");
  redirect("/student/proposals");
}

export async function hireProposal(formData: FormData) {
  const session = await maybeSession();
  const jobId = (formData.get("jobId") as string) || "";
  const proposalId = (formData.get("proposalId") as string) || "";
  void proposalId;
  trackEvent("proposal_hired", { jobId, proposalId }, session?.user.id);
  revalidatePath(`/client/jobs/${jobId}/proposals`);
  // In live mode: create order in `pending_payment`, then redirect to payment page.
  redirect(`/client/payment/${proposalId || "demo"}`);
}
