"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/dal";
import { runQualityGate } from "@/lib/ai/quality-gate";
import { resolveSubmissionOutcome } from "@/lib/orders/submission";
import { MAX_REVISIONS } from "@/lib/constants";
import { releaseEscrow } from "@/lib/razorpay/escrow";
import { recordHumanOutcome } from "@/lib/ai/calibration";
import { dispatchUserEmail } from "@/lib/email/dispatch";
import { orderSubmittedEmail, payoutSettledEmail } from "@/lib/email/templates";
import { getClientById } from "@/lib/data/queries";
import { rateLimit } from "@/lib/ratelimit";
import { trackEvent } from "@/lib/observability";
import { runAutoExport } from "@/lib/export/dispatch";
import {
  connectedExportDestinations,
  autoExport,
  shareableOrderIds,
} from "@/lib/demo/state";
import { dispatchPartnerWebhook } from "@/lib/partners/webhooks";
import { getStudentById } from "@/lib/data/queries";
import { getOrder } from "@/lib/data/queries";
import { services } from "@/lib/env";
import { getServiceSupabase } from "@/lib/supabase/server";
import { validateUpload } from "@/lib/uploads/validate";

/**
 * Order lifecycle Server Actions. Demo paths just revalidate + redirect;
 * live paths will write Supabase rows + fire Inngest + Razorpay calls.
 */

export async function submitWork(formData: FormData) {
  const session = await requireRole("student");
  const orderId = (formData.get("orderId") as string) || "";
  const notes = (formData.get("notes") as string) || "";
  const order = await getOrder(orderId);
  // Only the student who owns the order may submit work for it.
  if (!order || order.studentId !== session.user.id) redirect("/student/orders");

  // Blueprint: the quality-check trigger is rate limited per order.
  const limit = await rateLimit({
    key: `submitWork:${orderId}`,
    max: 5,
    windowMs: 60_000,
  });
  if (!limit.allowed) redirect(`/student/orders/${orderId}?error=rate_limited`);

  // Validate any attached deliverable files before they can touch Storage
  // or the AI gate. The validator (extension/MIME/size + the ZIP-traversal
  // guard it backs) is pure and unit-tested; the live Storage write lands
  // with the file-upload phase, but the guard belongs here now so an
  // invalid file is rejected at the boundary. Fail closed on the first one.
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  for (const file of files) {
    const check = validateUpload({
      filename: file.name,
      mime: file.type,
      size: file.size,
    });
    if (!check.ok) {
      redirect(`/student/orders/${orderId}?error=upload_invalid`);
    }
  }

  // Which revision attempt is this (1-based, capped at MAX_REVISIONS).
  const attempt = Math.min(
    MAX_REVISIONS,
    Math.max(1, Number(formData.get("attempt")) || 1)
  );

  // Run the AI gate. Files count as real work for the demo scorer (live
  // extracts their text); fold their presence into the scored text.
  const fileNote = files.length
    ? `\n[Attached ${files.length} file(s): ${files.map((f) => f.name).join(", ")}]`
    : "";
  // Live: upload files to Storage, fire Inngest 'ai/quality.check'.
  // Demo: run gate synchronously so the UI can show the result immediately.
  const review = await runQualityGate({
    orderId,
    jobBrief: {
      title: order.jobTitle,
      description: notes || "Submitted work for review.",
    },
    submissionText: notes + fileNote,
  });

  // ENFORCE the verdict (this is the moat). PASS -> client review; FAIL ->
  // back to the student with the issues; out of revisions -> escalate.
  const outcome = resolveSubmissionOutcome({
    verdict: review.verdict,
    attempt,
    maxAttempts: MAX_REVISIONS,
  });

  // Live: persist the review + the new order state. Demo: state is conveyed
  // through the redirect (the order/submit pages reflect it).
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase.from("ai_reviews").insert({
        order_id: orderId,
        score: review.score,
        verdict: review.verdict,
        brief_alignment: review.briefAlignment,
        completeness: review.completeness,
        quality: review.quality,
        originality: review.originality,
        flagged_for_review: review.flaggedForReview ?? false,
        issues: review.issues,
        suggestions: review.suggestions,
        reviewer_note: review.reviewerNote,
      });
      await supabase
        .from("orders")
        .update({ status: outcome.status, revision_count: attempt })
        .eq("id", orderId);
      if (outcome.escalated) {
        // Out of revisions: open a dispute for founder mediation/refund.
        await supabase.from("dispute_cases").insert({
          order_id: orderId,
          raised_by: session.user.id,
          reason: `AI gate failed after ${MAX_REVISIONS} attempts (last score ${review.score}/100).`,
          status: "open",
        });
      }
    }
  }

  trackEvent(
    "work_submitted",
    { orderId, verdict: review.verdict, attempt, status: outcome.status },
    session.user.id
  );
  revalidatePath(`/student/orders/${orderId}`);
  revalidatePath(`/client/orders/${orderId}`);

  if (review.verdict === "PASS") {
    // Only now does the client hear about it: passing work reaches them.
    const client = await getClientById(order!.clientId);
    await dispatchUserEmail(
      order!.clientId,
      orderSubmittedEmail({
        clientName: client?.fullName ?? "there",
        jobTitle: order!.jobTitle,
        orderId,
      }),
      "order_update",
      orderId
    );
    redirect(`/student/orders/${orderId}?submitted=1`);
  }

  if (outcome.escalated) {
    redirect(`/student/orders/${orderId}?escalated=1`);
  }

  // Failed but revisions remain: back to the resubmit form with the issues.
  redirect(`/student/orders/${orderId}/submit?fail=1&attempt=${attempt + 1}`);
}

export async function approveOrder(formData: FormData) {
  const session = await requireRole("client");
  const orderId = (formData.get("orderId") as string) || "";
  const order = await getOrder(orderId);
  // Only the client who funded the order may approve it and release escrow.
  if (!order || order.clientId !== session.user.id) redirect("/client/orders");

  // Look up the student's linked Route account (set when student first
  // configures payouts). releaseEscrow handles the demo + live branches
  // and the commission ledger write.
  let studentAccount: string | undefined;
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data } = await supabase
        .from("student_profiles")
        .select("razorpay_account_id")
        .eq("user_id", order!.studentId)
        .maybeSingle<{ razorpay_account_id: string | null }>();
      studentAccount = data?.razorpay_account_id ?? undefined;

      await supabase
        .from("orders")
        .update({
          status: "completed",
          approved_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }
  }

  await releaseEscrow({
    orderId,
    amount: order!.amount,
    studentRazorpayAccountId: studentAccount,
  });

  // Data moat: the client's approval labels the gate's decision.
  await recordHumanOutcome(orderId, "approved");

  const student = await getStudentById(order!.studentId);

  // Blueprint flow: student notified the payout settled.
  await dispatchUserEmail(
    order!.studentId,
    payoutSettledEmail({
      studentName: student?.fullName ?? "there",
      amount: Math.round(order!.amount * 0.85),
      orderTitle: order!.jobTitle,
    }),
    "payout_settled",
    orderId
  );

  // Partner milestone: a student's first completed job notifies their
  // college's placement cell (signed webhook; demo logs).
  if (student && student.jobsCompleted === 0) {
    await dispatchPartnerWebhook("student.completed_first_job", student.college, {
      username: student.username,
    });
  }

  // Auto-export the delivered work to the student's connected destinations,
  // now that the order is complete (AI-gate passed + approved + payout). The
  // plan engine keeps raw client files private unless the client licensed
  // public sharing for this order. Demo reads in-memory state; live will read
  // export_destinations + orders.shareable (Phase 2, with OAuth keys).
  if (autoExport.enabled) {
    await runAutoExport({
      orderId,
      studentId: order!.studentId,
      connected: [...connectedExportDestinations],
      clientShareable: shareableOrderIds.has(orderId),
    });
  }

  trackEvent("order_approved", { orderId }, session.user.id);
  revalidatePath(`/client/orders/${orderId}`);
  revalidatePath(`/student/orders/${orderId}`);
  revalidatePath("/client/orders");
  revalidatePath("/student/earnings");
  redirect(`/client/orders/${orderId}?approved=1`);
}

export async function requestRevision(formData: FormData) {
  const session = await requireRole("client");
  const orderId = (formData.get("orderId") as string) || "";
  const order = await getOrder(orderId);
  if (!order || order.clientId !== session.user.id) redirect("/client/orders");
  void formData.get("revisionNotes");
  await recordHumanOutcome(orderId, "revision_requested");
  trackEvent("revision_requested", { orderId }, session.user.id);
  revalidatePath(`/client/orders/${orderId}`);
  revalidatePath(`/student/orders/${orderId}`);
  redirect(`/client/orders/${orderId}?revisionRequested=1`);
}

export async function leaveReview(formData: FormData) {
  const session = await requireRole("client");
  const orderId = (formData.get("orderId") as string) || "";
  const order = await getOrder(orderId);
  if (!order || order.clientId !== session.user.id) redirect("/client/orders");
  const rating = Number(formData.get("rating") || 0);
  void formData.get("comment");
  trackEvent("order_reviewed", { orderId, rating }, session.user.id);
  revalidatePath(`/client/orders/${orderId}`);
  redirect(`/client/orders/${orderId}?reviewed=1`);
}
