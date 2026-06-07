/**
 * Smart-match notification fan-out (M5 / P5).
 *
 * Selects the top-N matched students for a freshly posted job, excludes
 * students who already proposed, and enforces the 3-emails/student/day
 * cap via notification_log.
 *
 * Demo path: returns the selection and logs intended sends (no key, no
 * email leaves the box). Live path (services.resend + a resolved email):
 * renders the match-alert template, sends via Resend, and records a
 * notification_log row for cap enforcement. Mirrors the demo/live branch
 * in lib/ai/quality-gate.ts.
 */

import type { Job, Proposal, StudentProfile } from "@/lib/types";
import { rankStudentsForJob, type MatchBreakdown } from "@/lib/matching/engine";
import { services } from "@/lib/env";
import { sendEmail } from "@/lib/email/client";
import { matchAlertEmail } from "@/lib/email/templates";
import {
  underDailyMatchCap,
  recordNotification,
  countRecentNotifications,
  DAILY_MATCH_EMAIL_CAP,
} from "@/lib/notifications/log";

export interface MatchSelection {
  student: StudentProfile;
  breakdown: MatchBreakdown;
}

/** Returns top-N students for the job, with the daily cap applied per student. */
export async function selectTopMatchesForJob(
  job: Job,
  students: StudentProfile[],
  proposals: Proposal[],
  opts: {
    limit?: number;
    getTodaysEmailCount?: (studentId: string) => Promise<number>;
  } = {}
): Promise<MatchSelection[]> {
  const limit = opts.limit ?? 20;
  const proposed = new Set(
    proposals.filter((p) => p.jobId === job.id).map((p) => p.studentId)
  );
  const candidates = students.filter((s) => !proposed.has(s.id) && s.isAvailable);
  const ranked = rankStudentsForJob(job, candidates, { limit: limit * 2 });
  // Default cap source reads notification_log (0 in demo, so never caps there).
  const get =
    opts.getTodaysEmailCount ??
    ((id: string) => countRecentNotifications(id, "match_email", 24));
  const final: MatchSelection[] = [];
  for (const r of ranked) {
    if (final.length >= limit) break;
    const count = await get(r.student.id);
    if (count >= DAILY_MATCH_EMAIL_CAP) continue;
    final.push(r);
  }
  return final;
}

export interface FanoutResult {
  sent: number;
  skipped: number;
}

/**
 * Dispatch match-alert emails for a selection. In live mode an email
 * resolver maps studentId to the user's address (PII lives in the users
 * table, not StudentProfile). Demo mode logs intended sends.
 */
export async function notifyMatches(
  job: Job,
  selection: MatchSelection[],
  opts: { resolveEmail?: (studentId: string) => Promise<string | null> } = {}
): Promise<FanoutResult> {
  let sent = 0;
  let skipped = 0;

  for (const m of selection) {
    // Re-check the cap at send time; the selection may be stale.
    if (!(await underDailyMatchCap(m.student.id))) {
      skipped++;
      continue;
    }

    const message = matchAlertEmail({
      name: m.student.fullName,
      jobTitle: job.title,
      matchScore: m.breakdown.score,
      jobId: job.id,
    });

    const email = opts.resolveEmail
      ? await opts.resolveEmail(m.student.id)
      : null;

    if (services.resend && email) {
      const res = await sendEmail(email, message);
      if (!res.ok) {
        skipped++;
        continue;
      }
      await recordNotification({
        userId: m.student.id,
        kind: "match_email",
        subject: message.subject,
        relatedId: job.id,
      });
      sent++;
    } else {
      // Demo / no-resolver path: log the intended send, do not deliver.
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `[matching] would notify ${m.student.username} for job ${job.id}: "${message.subject}"`
        );
      }
      sent++;
    }
  }

  return { sent, skipped };
}
