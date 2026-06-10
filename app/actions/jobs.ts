"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { maybeSession } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/ratelimit";
import { trackEvent } from "@/lib/observability";
import { planForDays } from "@/lib/monetization/featured";
import { requireRole } from "@/lib/auth/dal";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";
import * as demoState from "@/lib/demo/state";

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

  // P9.1 featured listing: if the client picked a plan, charge it.
  // Live path: create a Razorpay order for plan.amountPaise with
  // notes { featured_days, featured_job_id }; the payments webhook sets
  // jobs.featured_until on payment.captured. Demo: record the intent.
  const featuredDays = Number(formData.get("featuredDays") || 0);
  const plan = featuredDays ? planForDays("job", featuredDays) : null;
  if (plan) {
    trackEvent(
      "featured_selected",
      { days: plan.days, amountRupees: plan.amountRupees },
      session?.user.id
    );
  }

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

  const coverLetter = ((formData.get("coverLetter") as string) || "").trim();
  void formData.get("bidAmount");
  void formData.get("deliveryDays");

  // #43 save-as-template: store the pitch for reuse on future bids.
  if (formData.get("saveTemplate") === "on" && coverLetter && session) {
    if (services.supabase) {
      const supabase = getServiceSupabase();
      if (supabase) {
        await supabase.from("proposal_templates").insert({
          student_id: session.user.id,
          label: coverLetter.slice(0, 48),
          body: coverLetter,
        });
      }
    } else {
      demoState.proposalTemplates.unshift({
        id: `tpl-${Date.now()}`,
        studentId: session.user.id,
        label: coverLetter.slice(0, 48),
        body: coverLetter,
        createdAt: Date.now(),
      });
    }
    trackEvent("proposal_template_saved", { jobId }, session.user.id);
  }

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

/** #40 saved jobs: toggle a job in the student's shortlist. */
export async function toggleSaveJob(formData: FormData) {
  const session = await requireRole("student");
  const jobId = (formData.get("jobId") as string) || "";
  if (!jobId) redirect("/student/jobs");

  let saved: boolean;
  if (services.supabase) {
    const supabase = getServiceSupabase();
    const { data } = (await supabase
      ?.from("saved_jobs")
      .select("job_id")
      .eq("student_id", session.user.id)
      .eq("job_id", jobId)
      .maybeSingle()) ?? { data: null };
    if (data) {
      await supabase
        ?.from("saved_jobs")
        .delete()
        .eq("student_id", session.user.id)
        .eq("job_id", jobId);
      saved = false;
    } else {
      await supabase
        ?.from("saved_jobs")
        .insert({ student_id: session.user.id, job_id: jobId });
      saved = true;
    }
  } else {
    if (demoState.savedJobIds.has(jobId)) {
      demoState.savedJobIds.delete(jobId);
      saved = false;
    } else {
      demoState.savedJobIds.add(jobId);
      saved = true;
    }
  }
  trackEvent("job_save_toggled", { jobId, saved }, session.user.id);
  revalidatePath(`/student/jobs/${jobId}`);
  redirect(`/student/jobs/${jobId}?saved=${saved ? "1" : "0"}`);
}

/** #56 block client: hide this client's jobs from the student's feeds. */
export async function blockClient(formData: FormData) {
  const session = await requireRole("student");
  const clientId = (formData.get("clientId") as string) || "";
  const jobId = (formData.get("jobId") as string) || "";
  if (!clientId) redirect("/student/jobs");

  if (services.supabase) {
    const supabase = getServiceSupabase();
    await supabase
      ?.from("blocked_clients")
      .upsert({ student_id: session.user.id, client_id: clientId });
  } else {
    demoState.blockedClientIds.add(clientId);
  }
  trackEvent("client_blocked", { clientId }, session.user.id);
  revalidatePath("/student/jobs");
  redirect(jobId ? "/student/jobs?blocked=1" : "/student/jobs");
}
