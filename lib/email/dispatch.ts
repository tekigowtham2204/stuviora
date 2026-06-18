import "server-only";
import { sendEmail } from "@/lib/email/client";
import type { EmailMessage } from "@/lib/email/templates";
import {
  recordNotification,
  type NotificationKind,
} from "@/lib/notifications/log";
import { getServiceSupabase } from "@/lib/supabase/server";
import { getNotificationPreferences } from "@/lib/data/queries";
import { services } from "@/lib/env";

/**
 * Opt-out-able email kinds and the preference flag that gates each. Kinds not
 * listed (payout_settled, ai_gate_result, dispute_event, tier_upgraded) are
 * transactional and always sent.
 */
const PREF_GATE: Partial<
  Record<NotificationKind, "emailJobMatches" | "emailOrderUpdates" | "emailWeeklyDigest">
> = {
  match_email: "emailJobMatches",
  order_update: "emailOrderUpdates",
  weekly_digest: "emailWeeklyDigest",
};

/**
 * Order-lifecycle email dispatch (blueprint flow: "client notified" /
 * "student notified" on hire, submit, payout).
 *
 * Resolves the recipient's address from the users table in live mode,
 * sends via Resend, and records a notification_log row. Demo mode logs
 * the intended send (sendEmail's demo path) so the loop is observable
 * with zero keys. Never throws: a failed notification must not break
 * the action that triggered it.
 */
export async function dispatchUserEmail(
  userId: string,
  message: EmailMessage,
  kind: NotificationKind,
  relatedId?: string
): Promise<void> {
  try {
    // Respect the recipient's email preferences for opt-out-able kinds. A
    // missing prefs row defaults to sending (we never silently suppress
    // without an explicit opt-out).
    const gate = PREF_GATE[kind];
    if (gate) {
      const prefs = await getNotificationPreferences(userId);
      if (prefs && prefs[gate] === false) return;
    }

    let email: string | null = null;
    if (services.supabase) {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data } = await supabase
          .from("users")
          .select("email")
          .eq("id", userId)
          .maybeSingle<{ email: string | null }>();
        email = data?.email ?? null;
      }
    }
    const res = await sendEmail(email ?? `${userId}@demo.stuviora.local`, message);
    if (res.ok && !res.demo) {
      await recordNotification({
        userId,
        kind,
        subject: message.subject,
        relatedId,
      });
    }
  } catch {
    // Notification failures are logged by the email client; never block.
  }
}
