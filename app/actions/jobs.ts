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
import { dispatchUserEmail } from "@/lib/email/dispatch";
import { orderHiredEmail } from "@/lib/email/templates";
import { getJob, listJobProposals, getStudentById } from "@/lib/data/queries";

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
  const description = ((formData.get("description") as string) || "").trim();
  const category = (formData.get("category") as string) || "";
  const budgetMin = Number(formData.get("budgetMin") || 0) || null;
  const budgetMax = Number(formData.get("budgetMax") || 0) || null;
  const deadlineDays = Number(formData.get("deadlineDays") || 7);

  // Live write: insert the job for the session client. Demo: in-memory only.
  if (services.supabase && session) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data: cat } = await supabase
        .from("job_categories")
        .select("id")
        .eq("slug", category)
        .maybeSingle<{ id: string }>();
      await supabase.from("jobs").insert({
        client_id: session.user.id,
        category_id: cat?.id ?? null,
        title,
        description,
        budget_min: budgetMin,
        budget_max: budgetMax,
        deadline: new Date(Date.now() + deadlineDays * 86400_000).toISOString(),
        status: "open",
      });
    }
  }

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

  // Live write: insert the proposal (unique per job+student).
  if (services.supabase && session) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase.from("proposals").upsert(
        {
          job_id: jobId,
          student_id: session.user.id,
          cover_letter: coverLetter,
          bid_amount: Number(formData.get("bidAmount") || 0),
          delivery_days: Number(formData.get("deliveryDays") || 0) || null,
          status: "submitted",
        },
        { onConflict: "job_id,student_id" }
      );
    }
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
  trackEvent("proposal_hired", { jobId, proposalId }, session?.user.id);

  // Blueprint flow: the hired student is notified with escrow context.
  const [job, proposals] = await Promise.all([
    getJob(jobId),
    listJobProposals(jobId),
  ]);
  const hired = proposals.find((p) => p.id === proposalId);

  // Live write: create the order in pending_payment; the payment page +
  // webhook take it from there.
  if (services.supabase && job && hired) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase.from("orders").insert({
        job_id: job.id,
        proposal_id: hired.id,
        client_id: job.clientId,
        student_id: hired.studentId,
        amount: hired.bidAmount,
        status: "pending_payment",
        deadline: new Date(
          Date.now() + (hired.deliveryDays || 7) * 86400_000
        ).toISOString(),
      });
      await supabase
        .from("proposals")
        .update({ status: "accepted" })
        .eq("id", hired.id);
    }
  }

  if (job && hired) {
    const hiredStudent = await getStudentById(hired.studentId);
    await dispatchUserEmail(
      hired.studentId,
      orderHiredEmail({
        studentName: hiredStudent?.fullName ?? "there",
        jobTitle: job.title,
        amount: hired.bidAmount,
        orderId: proposalId,
      }),
      "order_update",
      jobId
    );
  }
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

/** #21 saved search: remember a category filter for alerting (P5 emails). */
export async function saveSearch(formData: FormData) {
  const session = await requireRole("student");
  const category = ((formData.get("category") as string) || "all").trim();
  demoState.savedSearches.add(category);
  trackEvent("search_saved", { category }, session.user.id);
  const qs = new URLSearchParams({ search: "saved" });
  if (category !== "all") qs.set("category", category);
  redirect(`/student/jobs?${qs.toString()}`);
}
