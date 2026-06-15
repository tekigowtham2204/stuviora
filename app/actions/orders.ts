"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/dal";
import { runQualityGate } from "@/lib/ai/quality-gate";
import { releaseEscrow } from "@/lib/razorpay/escrow";
import { recordHumanOutcome } from "@/lib/ai/calibration";
import { dispatchUserEmail } from "@/lib/email/dispatch";
import { orderSubmittedEmail, payoutSettledEmail } from "@/lib/email/templates";
import { getClientById } from "@/lib/data/queries";
import { rateLimit } from "@/lib/ratelimit";
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

  // Live: upload files to Storage, fire Inngest 'ai/quality.check'.
  // Demo: run gate synchronously so UI can show the result immediately.
  await runQualityGate({
    orderId,
    jobBrief: { title: order.jobTitle, description: notes || "Submitted work for review." },
    submissionText: notes,
  });

  // Blueprint flow: client notified that a delivery is ready.
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

  revalidatePath(`/student/orders/${orderId}`);
  revalidatePath(`/client/orders/${orderId}`);
  redirect(`/student/orders/${orderId}?submitted=1`);
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
  revalidatePath(`/client/orders/${orderId}`);
  revalidatePath(`/student/orders/${orderId}`);
  await recordHumanOutcome(orderId, "revision_requested");
  redirect(`/client/orders/${orderId}?revisionRequested=1`);
}

export async function leaveReview(formData: FormData) {
  const session = await requireRole("client");
  const orderId = (formData.get("orderId") as string) || "";
  const order = await getOrder(orderId);
  if (!order || order.clientId !== session.user.id) redirect("/client/orders");
  void formData.get("rating");
  void formData.get("comment");
  revalidatePath(`/client/orders/${orderId}`);
  redirect(`/client/orders/${orderId}?reviewed=1`);
}
