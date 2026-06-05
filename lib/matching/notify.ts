/**
 * Smart-match notification fan-out (M5).
 *
 * Selects the top-N matched students for a freshly posted job, excludes
 * students who already proposed, and enforces the 3-emails/student/day cap.
 *
 * Demo path: returns the selection synchronously.
 * Live path: fires Inngest event `matching/notify`, whose worker reads
 * `notification_log` for the cap and dispatches via Resend. Mirrors the
 * demo/live branch in lib/ai/quality-gate.ts.
 */

import type { Job, Proposal, StudentProfile } from "@/lib/types";
import { rankStudentsForJob, type MatchBreakdown } from "@/lib/matching/engine";

export interface MatchSelection {
  student: StudentProfile;
  breakdown: MatchBreakdown;
}

/** Returns top-N students for the job, with the cap applied per student. */
export async function selectTopMatchesForJob(
  job: Job,
  students: StudentProfile[],
  proposals: Proposal[],
  opts: { limit?: number; getTodaysEmailCount?: (studentId: string) => Promise<number> } = {}
): Promise<MatchSelection[]> {
  const limit = opts.limit ?? 20;
  const proposed = new Set(proposals.filter((p) => p.jobId === job.id).map((p) => p.studentId));
  const candidates = students.filter((s) => !proposed.has(s.id) && s.isAvailable);
  const ranked = rankStudentsForJob(job, candidates, { limit: limit * 2 });
  const get = opts.getTodaysEmailCount ?? (async () => 0);
  const final: MatchSelection[] = [];
  for (const r of ranked) {
    if (final.length >= limit) break;
    const count = await get(r.student.id);
    if (count >= 3) continue; // 3-emails/student/day cap
    final.push(r);
  }
  return final;
}

/** Demo stub: in live mode this fires the Inngest event and persists log rows. */
export async function notifyMatches(job: Job, selection: MatchSelection[]): Promise<void> {
  // Live path (TODO):
  //   import { inngest } from "@/lib/inngest";
  //   await inngest.send({ name: "matching/notify", data: { jobId: job.id,
  //     studentIds: selection.map(s => s.student.id) }});
  // The worker reads `notification_log`, renders the Resend template, and
  // inserts log rows for cap enforcement.
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[matching] would notify ${selection.length} students for job ${job.id}: ` +
        selection.map((s) => s.student.username).join(", ")
    );
  }
}
