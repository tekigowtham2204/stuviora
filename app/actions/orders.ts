"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { runQualityGate } from "@/lib/ai/quality-gate";
import { releaseEscrow } from "@/lib/razorpay/escrow";
import { getOrder } from "@/lib/data/queries";

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

  await releaseEscrow({ orderId, amount: order.amount });
  // Live: update orders.status, commission_events.status='settled', fire trust+portfolio jobs.

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
  redirect(`/client/orders/${orderId}?revisionRequested=1`);
}

export async function leaveReview(formData: FormData) {
  const orderId = (formData.get("orderId") as string) || "";
  void formData.get("rating");
  void formData.get("comment");
  revalidatePath(`/client/orders/${orderId}`);
  redirect(`/client/orders/${orderId}?reviewed=1`);
}
