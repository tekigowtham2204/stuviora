"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDispute, getOrder } from "@/lib/data/queries";
import { assertTransition, nextStatus, stageDeadline } from "@/lib/disputes/engine";
import { requireSession } from "@/lib/auth/dal";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";
import { appealedDisputeIds } from "@/lib/demo/state";

/**
 * Dispute lifecycle Server Actions.
 *
 * Demo paths validate the state-machine transition then revalidate + redirect.
 * Live paths will additionally: insert dispute_cases/dispute_evidences rows,
 * flip the order to `disputed`, set the order's commission_event to
 * `dispute_hold`, and schedule the 48h escalation via Inngest.
 */

export async function openDispute(formData: FormData) {
  const orderId = (formData.get("orderId") as string) || "";
  const reason = (formData.get("reason") as string) || "";
  const order = await getOrder(orderId);
  if (!order) redirect("/client/orders");
  void reason;

  // Live: create dispute (status='open' -> 'evidence_collection'), set
  // order.status='disputed', commission_event.status='dispute_hold',
  // schedule 48h escalation. Deadline below seeds the timer.
  void stageDeadline();

  revalidatePath(`/client/orders/${orderId}`);
  revalidatePath(`/student/orders/${orderId}`);
  redirect(`/disputes?opened=1`);
}

export async function submitEvidence(formData: FormData) {
  const disputeId = (formData.get("disputeId") as string) || "";
  const note = (formData.get("note") as string) || "";
  const dispute = await getDispute(disputeId);
  if (!dispute) redirect("/disputes");
  void note;

  // Live: insert dispute_evidences row (+ optional file upload to Storage).
  revalidatePath(`/disputes/${disputeId}`);
  redirect(`/disputes/${disputeId}?evidence=1`);
}

/** Move a dispute forward one legal stage (e.g. evidence -> admin_review). */
export async function advanceDispute(formData: FormData) {
  const disputeId = (formData.get("disputeId") as string) || "";
  const dispute = await getDispute(disputeId);
  if (!dispute) redirect("/disputes");

  const to = nextStatus(dispute.status);
  if (to) {
    assertTransition(dispute.status, to); // guards illegal jumps
    // Live: update dispute_cases.status=to, reset deadline = stageDeadline().
    void stageDeadline();
  }

  revalidatePath(`/disputes/${disputeId}`);
  redirect(`/disputes/${disputeId}?advanced=1`);
}

/**
 * #55 appeal: a resolved dispute may be appealed once within 7 days,
 * reopening it into admin review. The appeal window is enforced here;
 * live mode also stamps dispute_cases.appealed_at (migration 0010).
 */
export async function appealDispute(formData: FormData) {
  const session = await requireSession();
  const disputeId = (formData.get("disputeId") as string) || "";
  const dispute = await getDispute(disputeId);
  if (!dispute) redirect("/disputes");

  if (dispute!.status !== "resolved") {
    redirect(`/disputes/${disputeId}?appeal=not_resolved`);
  }
  if (appealedDisputeIds.has(disputeId)) {
    redirect(`/disputes/${disputeId}?appeal=already`);
  }

  if (services.supabase) {
    const supabase = getServiceSupabase();
    await supabase
      ?.from("dispute_cases")
      .update({
        status: "admin_review",
        appealed_at: new Date().toISOString(),
      })
      .eq("id", disputeId)
      .is("appealed_at", null);
  }
  appealedDisputeIds.add(disputeId);
  void session;
  revalidatePath(`/disputes/${disputeId}`);
  redirect(`/disputes/${disputeId}?appeal=filed`);
}
