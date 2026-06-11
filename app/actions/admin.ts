"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDispute } from "@/lib/data/queries";
import { assertTransition, resolveOutcome } from "@/lib/disputes/engine";
import type { DisputeResolution } from "@/lib/types";

/**
 * Admin (founder) Server Actions. Every privileged action writes an immutable
 * row to `admin_actions` in live mode - the audit trail is non-negotiable.
 * Demo paths validate inputs, then revalidate + redirect.
 */

export async function resolveDispute(formData: FormData) {
  const disputeId = (formData.get("disputeId") as string) || "";
  const resolution = (formData.get("resolution") as DisputeResolution) || "pending";
  const reason = (formData.get("reason") as string) || "";
  const studentShare = Number(formData.get("studentShare") ?? "0.5");

  const dispute = await getDispute(disputeId);
  if (!dispute) redirect("/admin/disputes");

  // Only admin_review disputes can be resolved.
  assertTransition(dispute.status, "resolved");

  // Compute how escrow unwinds; live path applies the transfers + reversals.
  const outcome = resolveOutcome(resolution, studentShare);
  void outcome;
  void reason;

  // Live: update dispute_cases (status='resolved', resolution, resolved_by,
  // resolved_at), unwind commission_event from dispute_hold per `outcome`,
  // fire Razorpay refund/transfer, insert admin_actions row, recompute trust.
  revalidatePath(`/admin/disputes`);
  revalidatePath(`/admin/dashboard`);
  revalidatePath(`/disputes/${disputeId}`);
  redirect(`/admin/disputes?resolved=${disputeId}`);
}

export async function overridePayout(formData: FormData) {
  const orderId = (formData.get("orderId") as string) || "";
  const reason = (formData.get("reason") as string) || "";
  void reason;

  // Live: force-release escrow via Razorpay, settle commission_event,
  // insert admin_actions(action='payout_override', target=orderId, reason).
  revalidatePath(`/admin/dashboard`);
  redirect(`/admin/dashboard?override=${orderId}`);
}

export async function toggleUserActive(formData: FormData) {
  const userId = (formData.get("userId") as string) || "";
  const activate = formData.get("activate") === "true";
  const reason = (formData.get("reason") as string) || "";
  void reason;
  void activate;

  // Live: update users.is_active, insert admin_actions(action='user_ban'|'user_reactivate').
  revalidatePath(`/admin/users`);
  redirect(`/admin/users?updated=${userId}`);
}
