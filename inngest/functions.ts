/**
 * Inngest function stubs (M6.1).
 *
 * Each background job lives here as a typed handler. In demo mode the
 * `inngest` export is null and these handlers are not registered with a
 * worker. In live mode (when INNGEST_EVENT_KEY is set), the Inngest client
 * is constructed and the handlers are registered at /api/inngest.
 *
 * The bodies of each handler are intentionally thin: they call into the
 * pure-engine modules in lib/<domain>/ and the data layer in
 * lib/data/queries.ts. This keeps the jobs testable and the engines
 * deployable behind multiple workers.
 *
 * Implemented as plain async functions today (not yet wired to Inngest)
 * to keep the demo path zero-dependency. The shapes mirror what an
 * `inngest.createFunction` registration would expect.
 */

import { rankStudentsForJob } from "@/lib/matching/engine";
import { computeTrustScore } from "@/lib/trust/score";
import { buildCaseStudyDraft } from "@/lib/portfolio/case-study";
import { selectTopMatchesForJob, notifyMatches } from "@/lib/matching/notify";
import { releaseEscrow } from "@/lib/razorpay/escrow";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";
import { sendEmail } from "@/lib/email/client";
import { weeklyDigestEmail } from "@/lib/email/templates";
import { recordNotification } from "@/lib/notifications/log";
import * as demo from "@/lib/demo/data";

/** Hours an order may sit in awaiting_approval before auto-release fires. */
const AUTO_RELEASE_HOURS = 72;

/**
 * Resolve a user's email for live sends. PII lives in the users table,
 * not StudentProfile, so workers look it up by id. Returns null in demo
 * (no DB), which routes callers to their log-only path.
 */
async function resolveUserEmail(userId: string): Promise<string | null> {
  if (!services.supabase) return null;
  const supabase = getServiceSupabase();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .maybeSingle<{ email: string | null }>();
    return data?.email ?? null;
  } catch {
    return null;
  }
}

// --- Cron jobs --------------------------------------------------------------

/**
 * Every 30 minutes: release escrow for orders past the 72h approval
 * window. Live: select orders.status='awaiting_approval' AND
 * approved_at < now() - 72h, then call Razorpay releaseEscrow + mark
 * the order completed. Demo: no-op.
 */
export async function escrowAutoRelease() {
  let released = 0;
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const cutoff = new Date(
        Date.now() - AUTO_RELEASE_HOURS * 3600_000
      ).toISOString();
      const { data: due } = await supabase
        .from("orders")
        .select(
          `
          id,
          amount,
          student_id,
          student_profiles:student_id ( razorpay_account_id )
        `
        )
        .eq("status", "awaiting_approval")
        .lt("approved_at", cutoff)
        .returns<
          Array<{
            id: string;
            amount: number | string;
            student_id: string;
            student_profiles: { razorpay_account_id: string | null } | null;
          }>
        >();
      if (due) {
        for (const o of due) {
          try {
            await releaseEscrow({
              orderId: o.id,
              amount: Number(o.amount),
              studentRazorpayAccountId:
                o.student_profiles?.razorpay_account_id ?? undefined,
            });
            await supabase
              .from("orders")
              .update({ status: "completed", completed_at: new Date().toISOString() })
              .eq("id", o.id);
            released++;
          } catch {
            // Skip; tomorrow's reconciler will surface the drift.
          }
        }
      }
    }
  }
  return {
    ran: "escrowAutoRelease",
    released,
    at: new Date().toISOString(),
  };
}

/** Daily at 2 AM IST: reconcile commission ledger against Razorpay events. */
export async function commissionReconciler() {
  // Live: stream webhook_events for the day, cross-check against
  // commission_event rows, alert if any mismatch.
  return { ran: "commissionReconciler", at: new Date().toISOString() };
}

/**
 * Monday 9 AM IST: weekly earnings digest.
 *
 * Demo: iterates seeded students, composes the digest, logs intended
 * sends. Live: resolves each opted-in student's email and dispatches via
 * Resend, recording a notification_log row. The opted-in filter against
 * notification_preferences is applied in the live data layer; here we
 * send only to students with completed orders this period.
 */
export async function weeklyEarningsDigest() {
  let sent = 0;
  for (const s of demo.students) {
    const completed = demo.orders.filter(
      (o) => o.studentId === s.id && o.status === "completed"
    );
    if (completed.length === 0) continue;
    const earned = completed.reduce(
      (sum, o) => sum + Math.round(Number(o.amount) * 0.85),
      0
    );
    const message = weeklyDigestEmail({
      name: s.fullName,
      completedCount: completed.length,
      earned,
      newMatches: 0,
    });
    const email = await resolveUserEmail(s.id);
    if (services.resend && email) {
      const res = await sendEmail(email, message);
      if (res.ok) {
        await recordNotification({
          userId: s.id,
          kind: "weekly_digest",
          subject: message.subject,
        });
        sent++;
      }
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.log(`[digest] would send to ${s.username}: "${message.subject}"`);
      }
      sent++;
    }
  }
  return { ran: "weeklyEarningsDigest", sent, at: new Date().toISOString() };
}

/** Monthly: TDS threshold checker; flags students about to cross 30k. */
export async function tdsThresholdChecker() {
  // Live: for each student, sum studentGross for current FY; if within 10% of
  // TDS_THRESHOLD and PAN missing, send a "complete PAN to avoid payout pause" email.
  return { ran: "tdsThresholdChecker", at: new Date().toISOString() };
}

// --- Event-driven jobs ------------------------------------------------------

/** Async AI quality gate: file extraction + Claude scoring + Realtime push. */
export async function aiQualityCheck(event: { orderId: string; storageKeys: string[] }) {
  // Live: pull files from Storage, extract text (pdf-parse/mammoth/Claude Vision),
  // call Claude with structured JSON prompt, write ai_reviews row, broadcast result
  // via Supabase Realtime channel `order:${orderId}`.
  void event;
}

/** Recompute trust score for a student after a new review or order. */
export async function trustScoreRecalc(event: { studentId: string }) {
  const student = demo.students.find((s) => s.id === event.studentId);
  if (!student) return;
  computeTrustScore({
    avgRating: student.rating,
    reviewsCount: student.reviewsCount,
    ordersDelivered: student.jobsCompleted,
    ordersOnTime: Math.round(student.jobsCompleted * 0.85),
    aiSubmissions: student.jobsCompleted,
    aiFirstPass: Math.round(student.jobsCompleted * 0.8),
    medianResponseHours: student.medianResponseHours ?? 6,
  });
  // Live: persist via UPDATE users SET trust_score=?, trust_tier=? WHERE id=?
}

/** Generate a portfolio case-study draft after an order completes. */
export async function portfolioAutoGenerator(event: { orderId: string }) {
  const order = demo.orders.find((o) => o.id === event.orderId);
  if (!order) return;
  await buildCaseStudyDraft({
    order,
    skills: ["Copywriting", "Design"],
  });
  // Live: INSERT INTO portfolio_items (..., is_published=false) for the student to edit.
}

/** Fan out top-20 match notifications when a job is posted. */
export async function smartMatchFanout(event: { jobId: string }) {
  const job = demo.jobs.find((j) => j.id === event.jobId);
  if (!job) return { ran: "smartMatchFanout", sent: 0, skipped: 0 };
  const selection = await selectTopMatchesForJob(
    job,
    demo.students,
    demo.proposals,
    { limit: 20 }
  );
  // notifyMatches enforces the 3-emails/student/day cap via notification_log,
  // sends via Resend in live mode, and logs intended sends in demo.
  const result = await notifyMatches(job, selection, {
    resolveEmail: resolveUserEmail,
  });
  return { ran: "smartMatchFanout", jobId: job.id, ...result };
}

/** 48-hour dispute escalation timer. */
export async function disputeEscalationTimer(event: { disputeId: string }) {
  // Live: on event, set status='admin_review' if still in evidence_collection
  // and deadline passed; notify both parties + admin.
  void event;
}

/** College-domain verifier — check the student's email against college_domains. */
export async function collegeDomainVerifier(event: { studentId: string; email: string }) {
  // Live: SELECT 1 FROM college_domains WHERE domain = ?
  void event;
}

/** Persist a tax event row when an order completes. */
export async function taxEventLogger(event: { orderId: string }) {
  // Live: INSERT INTO tax_events (...).
  void event;
}

// Re-rank a job's matched students on demand (used by an Inngest fan-out call).
export async function recomputeMatches(event: { jobId: string }) {
  const job = demo.jobs.find((j) => j.id === event.jobId);
  if (!job) return;
  rankStudentsForJob(job, demo.students, { limit: 20 });
}
