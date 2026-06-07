/**
 * Smart matching engine — Stuviora M5.
 *
 * Pure functions only. Both directions (rank jobs for student, rank students
 * for job) reduce to one scorer over normalized signals.
 *
 * Formula (from master plan §4):
 *   score = skill_overlap·0.45 + budget_fit·0.25 + trust·0.20 + availability·0.10
 *
 * All component values are normalised to 0..100. The final `score` is also
 * 0..100 (sum of contributions). The breakdown shape mirrors TrustBreakdown
 * from lib/trust/score.ts so existing UI patterns can be reused.
 *
 * Live path notes:
 *  - Skill overlap will eventually consult `job_skill_requirements.weight`
 *    and `student_skills.proficiency` instead of plain string arrays.
 *  - Budget fit will use a learned hours-per-category estimator once we have
 *    enough completed orders.
 */

import type { Job, StudentProfile } from "@/lib/types";

export const MATCH_WEIGHTS = {
  skill: 0.45,
  budget: 0.25,
  trust: 0.2,
  availability: 0.1,
} as const;

export interface MatchSignals {
  studentSkills: string[];
  jobSkills: string[];
  studentHourlyFrom: number;
  jobBudgetMin: number;
  jobBudgetMax: number;
  deadlineDays: number;
  trustScore: number;
  isAvailable: boolean;
  activeOrderCount: number;
  /** Optional same-category bonus (helps when skills array is small). */
  sameCategory?: boolean;
}

export interface MatchComponent {
  key: "skill" | "budget" | "trust" | "availability";
  label: string;
  /** 0..100 raw component score. */
  value: number;
  /** Weight 0..1. */
  weight: number;
  /** Weighted contribution to the final 0..100 score. */
  contribution: number;
  /** Short human-readable explanation. */
  hint: string;
}

export interface MatchBreakdown {
  /** Final 0..100 score (rounded to one decimal). */
  score: number;
  components: MatchComponent[];
}

/**
 * Skill overlap = how many of the job's required skills the student has,
 * divided by the total required. Job skills define the denominator so a
 * student with unrelated breadth isn't penalised.
 */
function scoreSkillOverlap(studentSkills: string[], jobSkills: string[], sameCategory: boolean): number {
  if (jobSkills.length === 0) {
    // No skills declared; lean on the category match as a soft signal.
    return sameCategory ? 60 : 30;
  }
  const set = new Set(studentSkills.map((s) => s.toLowerCase()));
  const hits = jobSkills.filter((s) => set.has(s.toLowerCase())).length;
  const base = (hits / jobSkills.length) * 100;
  // Modest bonus for category alignment when overlap is non-zero.
  if (hits > 0 && sameCategory) {
    return Math.min(100, base + 8);
  }
  return base;
}

/**
 * Budget fit = how well the student's expected price for the work lands inside
 * the job's budget range. We use deadlineDays as a coarse hours-per-day proxy
 * (~6 working hours/day) until a real estimator exists.
 */
function scoreBudgetFit(
  hourlyFrom: number,
  budgetMin: number,
  budgetMax: number,
  deadlineDays: number
): number {
  const expectedHours = Math.max(2, deadlineDays * 6);
  const expectedCost = hourlyFrom * expectedHours;
  if (budgetMax <= 0) return 50; // no signal
  if (expectedCost >= budgetMin && expectedCost <= budgetMax) return 100;
  // Linear falloff outside the range, plateauing at 0 once 2x outside.
  const distance =
    expectedCost < budgetMin ? budgetMin - expectedCost : expectedCost - budgetMax;
  const span = Math.max(1, budgetMax - budgetMin);
  const falloff = Math.min(1, distance / (span * 2));
  return Math.round((1 - falloff) * 100);
}

function scoreTrust(trustScore: number): number {
  return Math.max(0, Math.min(100, trustScore));
}

function scoreAvailability(isAvailable: boolean, activeOrderCount: number): number {
  if (!isAvailable) return 0;
  if (activeOrderCount >= 3) return 50;
  if (activeOrderCount === 0) return 100;
  // 1-2 active orders: gentle taper.
  return 100 - activeOrderCount * 15;
}

export function computeMatch(signals: MatchSignals): MatchBreakdown {
  const skill = scoreSkillOverlap(signals.studentSkills, signals.jobSkills, !!signals.sameCategory);
  const budget = scoreBudgetFit(
    signals.studentHourlyFrom,
    signals.jobBudgetMin,
    signals.jobBudgetMax,
    signals.deadlineDays
  );
  const trust = scoreTrust(signals.trustScore);
  const availability = scoreAvailability(signals.isAvailable, signals.activeOrderCount);

  const components: MatchComponent[] = [
    {
      key: "skill",
      label: "Skill fit",
      value: Math.round(skill),
      weight: MATCH_WEIGHTS.skill,
      contribution: skill * MATCH_WEIGHTS.skill,
      hint:
        skill >= 80
          ? "Strong overlap with required skills"
          : skill >= 50
          ? "Most required skills covered"
          : "Partial skill overlap",
    },
    {
      key: "budget",
      label: "Budget fit",
      value: Math.round(budget),
      weight: MATCH_WEIGHTS.budget,
      contribution: budget * MATCH_WEIGHTS.budget,
      hint:
        budget >= 90
          ? "Pricing lands inside the budget"
          : budget >= 60
          ? "Pricing is close to the budget"
          : "Pricing sits outside the budget",
    },
    {
      key: "trust",
      label: "Trust",
      value: Math.round(trust),
      weight: MATCH_WEIGHTS.trust,
      contribution: trust * MATCH_WEIGHTS.trust,
      hint:
        trust >= 80
          ? "High platform trust"
          : trust >= 60
          ? "Established track record"
          : "Building track record",
    },
    {
      key: "availability",
      label: "Availability",
      value: Math.round(availability),
      weight: MATCH_WEIGHTS.availability,
      contribution: availability * MATCH_WEIGHTS.availability,
      hint:
        availability === 100
          ? "Open and free to start"
          : availability >= 70
          ? "Open with light load"
          : availability >= 50
          ? "Open but already busy"
          : "Not accepting work right now",
    },
  ];

  const score = Math.round(components.reduce((s, c) => s + c.contribution, 0) * 10) / 10;
  return { score, components };
}

/**
 * Rank jobs for a student. Returns sorted desc.
 * `offset` + `limit` give simple windowed pagination; pass `total: true`
 * via the wrapper if you need the full count for prev/next math.
 */
export function rankJobsForStudent(
  student: StudentProfile,
  jobs: Job[],
  opts: { limit?: number; offset?: number } = {}
): Array<{ job: Job; breakdown: MatchBreakdown }> {
  const ranked = jobs.map((job) => ({
    job,
    breakdown: computeMatch({
      studentSkills: student.skills,
      jobSkills: job.skills,
      studentHourlyFrom: student.hourlyFrom,
      jobBudgetMin: job.budgetMin,
      jobBudgetMax: job.budgetMax,
      deadlineDays: job.deadlineDays,
      trustScore: student.trustScore,
      isAvailable: student.isAvailable,
      activeOrderCount: student.activeOrderCount,
      sameCategory: student.categorySlug === job.categorySlug,
    }),
  }));
  ranked.sort((a, b) => b.breakdown.score - a.breakdown.score);
  const start = Math.max(0, opts.offset ?? 0);
  return opts.limit ? ranked.slice(start, start + opts.limit) : ranked.slice(start);
}

/** Rank students for a job. Returns sorted desc, with optional offset. */
export function rankStudentsForJob(
  job: Job,
  students: StudentProfile[],
  opts: { limit?: number; offset?: number } = {}
): Array<{ student: StudentProfile; breakdown: MatchBreakdown }> {
  const ranked = students.map((student) => ({
    student,
    breakdown: computeMatch({
      studentSkills: student.skills,
      jobSkills: job.skills,
      studentHourlyFrom: student.hourlyFrom,
      jobBudgetMin: job.budgetMin,
      jobBudgetMax: job.budgetMax,
      deadlineDays: job.deadlineDays,
      trustScore: student.trustScore,
      isAvailable: student.isAvailable,
      activeOrderCount: student.activeOrderCount,
      sameCategory: student.categorySlug === job.categorySlug,
    }),
  }));
  ranked.sort((a, b) => b.breakdown.score - a.breakdown.score);
  const start = Math.max(0, opts.offset ?? 0);
  return opts.limit ? ranked.slice(start, start + opts.limit) : ranked.slice(start);
}
