/**
 * AI proposal writer (M5.2).
 *
 * Demo: returns a deterministic, hand-tuned template that uses the student's
 * actual skills + portfolio + the job brief. The template is intentionally
 * scaffolded so it reads like a first draft the student edits, never an
 * auto-send (master plan §10 guardrail).
 *
 * Live path (TODO): replace the demo branch with a structured Claude
 * prompt. Inputs: job brief, student profile, top-3 relevant portfolio
 * items, target word-count. Output JSON: { greeting, hook, plan[], close }.
 *
 * Async to match the live shape so the call-site doesn't change.
 */

import type { Job, PortfolioItem, StudentProfile } from "@/lib/types";

interface WriteProposalInput {
  job: Job;
  student: StudentProfile;
  portfolio: PortfolioItem[];
  /** Optional bid the student is considering — woven into the close. */
  bidAmount?: number;
}

export interface ProposalDraft {
  greeting: string;
  hook: string;
  plan: string[];
  close: string;
  full: string;
}

export async function writeProposalDraft({
  job,
  student,
  portfolio,
  bidAmount,
}: WriteProposalInput): Promise<ProposalDraft> {
  const studentSkills = new Set(student.skills.map((s) => s.toLowerCase()));
  const overlap = job.skills.filter((s) => studentSkills.has(s.toLowerCase()));
  const overlapText = overlap.length ? overlap.slice(0, 3).join(", ") : student.skills.slice(0, 3).join(", ");

  const relevantPortfolio = portfolio
    .filter((p) => p.skills.some((s) => job.skills.some((js) => js.toLowerCase() === s.toLowerCase())))
    .slice(0, 1);

  const greeting = `Hi,`;
  const hook = `Saw your brief for "${job.title}". I've shipped work in ${overlapText}, so I can move fast without ramp.`;

  const plan: string[] = [];
  plan.push(`First, I'll send a one-page plan with timeline and key questions, within 24 hours.`);
  if (relevantPortfolio[0]) {
    plan.push(
      `For context, a recent win: "${relevantPortfolio[0].title}" — ${relevantPortfolio[0].outcome.toLowerCase()}`
    );
  }
  plan.push(
    `Then I'll deliver in ${Math.max(3, job.deadlineDays - 2)} days, with a short check-in midway so nothing surprises you.`
  );

  const closeBid = bidAmount
    ? `My bid: Rs. ${bidAmount.toLocaleString("en-IN")} (revisions included).`
    : `Happy to share a fixed price once you confirm scope.`;
  const close = `${closeBid} If this fits, hit accept and I'll start today.\n\nThanks,\n${student.fullName}`;

  const full = `${greeting}\n\n${hook}\n\n${plan.map((p) => `- ${p}`).join("\n")}\n\n${close}`;
  return { greeting, hook, plan, close, full };
}
