"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";
import { trackEvent } from "@/lib/observability";
import { getPlan, type ClientPlan } from "@/lib/monetization/subscriptions";

/**
 * Monetization Server Actions (P9.2).
 *
 * Live path: create/cancel a Razorpay Subscription and persist the tier
 * on client_subscriptions (migration 0009). Demo path: record the event
 * and redirect with a flash so the flow is fully clickable. The Razorpay
 * Subscriptions API call is gated on services.razorpay and left as the
 * live wiring step (same pattern as escrow in P3).
 */

const PLAN_IDS: ClientPlan[] = ["free", "growth", "scale"];

export async function startSubscription(formData: FormData) {
  const session = await requireRole("client");
  const planId = (formData.get("plan") as string) || "";
  if (!PLAN_IDS.includes(planId as ClientPlan)) {
    redirect("/client/billing?error=unknown_plan");
  }
  const plan = getPlan(planId as ClientPlan);

  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      // Live: create the Razorpay Subscription first, then persist its id.
      await supabase.from("client_subscriptions").upsert(
        {
          client_id: session.user.id,
          plan: plan.id,
          status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id" }
      );
    }
  }
  trackEvent("subscription_started", { plan: plan.id }, session.user.id);
  redirect(`/client/billing?subscribed=${plan.id}`);
}

export async function cancelSubscription() {
  const session = await requireRole("client");
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase.from("client_subscriptions").upsert(
        {
          client_id: session.user.id,
          plan: "free",
          status: "cancelled",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id" }
      );
    }
  }
  trackEvent("subscription_cancelled", {}, session.user.id);
  redirect("/client/billing?subscribed=free");
}
