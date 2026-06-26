"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/dal";
import { runQualityGate } from "@/lib/ai/quality-gate";
import { resolveSubmissionOutcome } from "@/lib/orders/submission";
import { MAX_REVISIONS } from "@/lib/constants";
import {
  releaseEscrow,
  capturePayment,
  voidAuthorization,
  refundCapture,
} from "@/lib/razorpay/escrow";
import { recordHumanOutcome } from "@/lib/ai/calibration";
import { dispatchUserEmail } from "@/lib/email/dispatch";
import {
  orderSubmittedEmail,
  payoutSettledEmail,
  orderHiredEmail,
} from "@/lib/email/templates";
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

  // ENFORCE the verdict (this is the moat, and it runs with no human in the
  // loop). PASS -> capture payment + deliver; FAIL with revisions -> back to
  // the student; FAIL out of revisions -> void the hold, client pays nothing.
  const outcome = resolveSubmissionOutcome({
    verdict: review.verdict,
    attempt,
    maxAttempts: MAX_REVISIONS,
  });

  // Money follows the verdict automatically. PASS captures the held
  // authorization (client charged on receipt of quality-checked work);
  // auto-refund voids the hold so nothing is ever charged for work that
  // could not pass.
  if (review.verdict === "PASS") {
    await capturePayment({ orderId, amount: order!.amount });
  } else if (outcome.autoRefunded) {
    await voidAuthorization({ orderId });
  }

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
        issues: review.issues,
        suggestions: review.suggestions,
        reviewer_note: review.reviewerNote,
      });
      await supabase
        .from("orders")
        .update({
          status: outcome.status,
          revision_count: attempt,
          // On PASS the work is delivered now; stamp the dispute-window start
          // so the auto-settle cron knows when 72h is up. (Reusing approved_at
          // as the window-open timestamp avoids a schema change.)
          ...(review.verdict === "PASS"
            ? { approved_at: new Date().toISOString() }
            : {}),
        })
        .eq("id", orderId);
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
    // Captured + delivered: the client receives the work and the dispute
    // window opens. They are notified it is ready.
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

  if (outcome.autoRefunded) {
    // Could not pass after the last attempt: hold voided, client refunded.
    redirect(`/student/orders/${orderId}?refunded=1`);
  }

  // Failed but revisions remain: back to the resubmit form with the issues.
  redirect(`/student/orders/${orderId}/submit?fail=1&attempt=${attempt + 1}`);
}

export async function approveOrder(formData: FormData) {
  const session = await requireRole("client");
  const orderId = (formData.get("orderId") as string) || "";
  const order = await getOrder(orderId);
  // The client was already charged when the AI gate passed the work. This is
  // the optional "all good, release now" action that settles the student's
  // payout immediately instead of waiting out the dispute window. Only the
  // client on the order may trigger it.
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

  // In-window dispute, resolved automatically with no staff: the capture is
  // refunded and the order goes back to the student to fix and re-run through
  // the gate. When the new delivery passes, the client is charged again. The
  // client is never out of pocket while waiting for the fix.
  await refundCapture({ orderId, amount: order!.amount });
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase
        .from("orders")
        .update({ status: "revision_requested" })
        .eq("id", orderId);
    }
  }

  // Data moat: the client's call labels the gate's decision.
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

/**
 * Repeat-order shortcut (#10): rehire the same student for the same brief from
 * a completed order. Skips the post-job + proposal cycle entirely - the whole
 * point of a repeat order is that the relationship already exists. Creates a
 * fresh order in pending_payment against the original job + student and sends
 * the client to authorize payment, exactly like a first hire.
 */
export async function reorder(formData: FormData) {
  const session = await requireRole("client");
  const orderId = (formData.get("orderId") as string) || "";
  const order = await getOrder(orderId);
  // Only the client who owns a COMPLETED order may reorder from it.
  if (
    !order ||
    order.clientId !== session.user.id ||
    order.status !== "completed"
  ) {
    redirect("/client/orders");
  }

  // Rate limit repeat-order creation so it cannot be used to spam orders.
  const limit = await rateLimit({
    key: `reorder:${session.user.id}`,
    max: 10,
    windowMs: 60_000,
  });
  if (!limit.allowed) redirect(`/client/orders/${orderId}?error=rate_limited`);

  let newOrderId = orderId;
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data: created } = await supabase
        .from("orders")
        .insert({
          job_id: order!.jobId,
          client_id: order!.clientId,
          student_id: order!.studentId,
          amount: order!.amount,
          status: "pending_payment",
          deadline: new Date(
            Date.now() + (order!.deadlineDays || 7) * 86400_000
          ).toISOString(),
        })
        .select("id")
        .maybeSingle<{ id: string }>();
      if (created?.id) newOrderId = created.id;
    }
  }

  // Tell the student they have been rehired (payment authorized as a hold).
  const student = await getStudentById(order!.studentId);
  await dispatchUserEmail(
    order!.studentId,
    orderHiredEmail({
      studentName: student?.fullName ?? "there",
      jobTitle: order!.jobTitle,
      amount: order!.amount,
      orderId: newOrderId,
    }),
    "order_update",
    newOrderId
  );

  trackEvent(
    "order_reordered",
    { fromOrderId: orderId, newOrderId },
    session.user.id
  );
  revalidatePath("/client/orders");
  // Fund the new escrow, same as a first hire.
  redirect(`/client/payment/${newOrderId}`);
}
