import "server-only";
import { sendEmail } from "@/lib/email/client";
import type { EmailMessage } from "@/lib/email/templates";
import {
  recordNotification,
  type NotificationKind,
} from "@/lib/notifications/log";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";

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
