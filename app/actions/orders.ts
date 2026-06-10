"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { runQualityGate } from "@/lib/ai/quality-gate";
import { releaseEscrow } from "@/lib/razorpay/escrow";
import { recordHumanOutcome } from "@/lib/ai/calibration";
import { dispatchPartnerWebhook } from "@/lib/partners/webhooks";
import { getStudentById } from "@/lib/data/queries";
import { getOrder } from "@/lib/data/queries";
import { services } from "@/lib/env";
import { getServiceSupabase } from "@/lib/supabase/server";

/**
 * Order lifecycle Server Actions. Demo paths just revalidate + redirect;
 * live paths will write Supabase rows + fire Inngest + Razorpay calls.
 */

export async function submitWork(formData: FormData) {
  const orderId = (formData.get("orderId") as string) || "";
  const notes = (formData.get("notes") as string) || "";
  const order = await getOrder(orderId);
  if (!order) redirect("/student/orders");

  // Live: upload files to Storage, fire Inngest 'ai/quality.check'.
  // Demo: run gate synchronously so UI can show the result immediately.
  await runQualityGate({
    orderId,
    jobBrief: { title: order.jobTitle, description: notes || "Submitted work for review." },
    submissionText: notes,
  });

  revalidatePath(`/student/orders/${orderId}`);
  revalidatePath(`/client/orders/${orderId}`);
  redirect(`/student/orders/${orderId}?submitted=1`);
}

export async function approveOrder(formData: FormData) {
  const orderId = (formData.get("orderId") as string) || "";
  const order = await getOrder(orderId);
  if (!order) redirect("/client/orders");

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

  // Partner milestone: a student's first completed job notifies their
  // college's placement cell (signed webhook; demo logs).
  const student = await getStudentById(order!.studentId);
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
  const orderId = (formData.get("orderId") as string) || "";
  void formData.get("revisionNotes");
  revalidatePath(`/client/orders/${orderId}`);
  revalidatePath(`/student/orders/${orderId}`);
  await recordHumanOutcome(orderId, "revision_requested");
  redirect(`/client/orders/${orderId}?revisionRequested=1`);
}

export async function leaveReview(formData: FormData) {
  const orderId = (formData.get("orderId") as string) || "";
  void formData.get("rating");
  void formData.get("comment");
  revalidatePath(`/client/orders/${orderId}`);
  redirect(`/client/orders/${orderId}?reviewed=1`);
}
