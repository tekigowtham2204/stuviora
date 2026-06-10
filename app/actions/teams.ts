"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";
import { trackEvent } from "@/lib/observability";
import { computeTeamSplit } from "@/lib/teams/split";
import { getOrder } from "@/lib/data/queries";

/**
 * Team order Server Actions (P9.3).
 *
 * The order's lead student declares teammates + share percentages. Live
 * path persists order_team_members (migration 0009) and the escrow
 * release fans out via Razorpay Route multi-transfer using
 * computeTeamSplit. Demo path validates the math and redirects with the
 * computed split as a flash.
 */

export async function declareTeamSplit(formData: FormData) {
  const session = await requireRole("student");
  const orderId = (formData.get("orderId") as string) || "";
  const teammate = ((formData.get("teammate") as string) || "").trim();
  const teammatePct = Number(formData.get("teammatePct") || 0);

  const order = await getOrder(orderId);
  if (!order || order.studentId !== session.user.id) {
    redirect(`/student/orders/${orderId}?team=not_allowed`);
  }
  if (!teammate || teammatePct <= 0 || teammatePct >= 100) {
    redirect(`/student/orders/${orderId}?team=invalid`);
  }

  // Validate the math with the pure engine before persisting anything.
  const members = [
    { studentId: session.user.id, shareRatio: (100 - teammatePct) / 100 },
    { studentId: teammate, shareRatio: teammatePct / 100 },
  ];
  const split = computeTeamSplit(order!.amount, members);

  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase.from("order_team_members").upsert(
        members.map((m, i) => ({
          order_id: orderId,
          student_id: m.studentId,
          share_bps: Math.round(m.shareRatio * 10000),
          is_lead: i === 0,
        })),
        { onConflict: "order_id,student_id" }
      );
    }
  }
  trackEvent(
    "team_split_declared",
    { orderId, members: members.length, studentTotal: split.studentTotal },
    session.user.id
  );
  redirect(`/student/orders/${orderId}?team=saved&pct=${teammatePct}`);
}
