/**
 * Notification log access (P5).
 *
 * Append-only audit of every notification sent (table: notification_log,
 * migration 0004). Used to enforce the 3-emails/student/day match cap
 * (master plan section 4) and to power "N alerts this week" surfaces.
 *
 * These run in service-role contexts only (Inngest workers + Server
 * Actions), so they use getServiceSupabase, never the request-scoped
 * client. Demo path: count is 0 and records are no-ops, so the retention
 * loop runs without a database.
 */

import "server-only";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";

export type NotificationKind =
  | "match_email"
  | "order_update"
  | "weekly_digest"
  | "ai_gate_result"
  | "dispute_event"
  | "payout_settled"
  | "tier_upgraded"
  | "marketing";

export type NotificationChannel = "email" | "push" | "inapp" | "whatsapp";

/** The per-student, per-day cap on proactive match emails. */
export const DAILY_MATCH_EMAIL_CAP = 3;

/** Count notifications of a kind sent to a user within the last N hours. */
export async function countRecentNotifications(
  userId: string,
  kind: NotificationKind,
  withinHours = 24
): Promise<number> {
  if (!services.supabase) return 0;
  const supabase = getServiceSupabase();
  if (!supabase) return 0;
  const since = new Date(Date.now() - withinHours * 3600_000).toISOString();
  const { count, error } = await supabase
    .from("notification_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("kind", kind)
    .gte("sent_at", since);
  if (error) return 0;
  return count ?? 0;
}

export interface NotificationEntry {
  userId: string;
  kind: NotificationKind;
  channel?: NotificationChannel;
  subject?: string;
  relatedId?: string;
  payload?: Record<string, unknown>;
}

/** Record a sent notification. No-op in demo mode. */
export async function recordNotification(entry: NotificationEntry): Promise<void> {
  if (!services.supabase) return;
  const supabase = getServiceSupabase();
  if (!supabase) return;
  await supabase.from("notification_log").insert({
    user_id: entry.userId,
    kind: entry.kind,
    channel: entry.channel ?? "email",
    subject: entry.subject ?? null,
    related_id: entry.relatedId ?? null,
    payload: entry.payload ?? null,
  });
}

/**
 * True if the user is still under the daily match-email cap. Used by the
 * fan-out worker before each send.
 */
export async function underDailyMatchCap(userId: string): Promise<boolean> {
  const count = await countRecentNotifications(userId, "match_email", 24);
  return count < DAILY_MATCH_EMAIL_CAP;
}
