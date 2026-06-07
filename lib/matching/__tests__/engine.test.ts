import { describe, it, expect } from "vitest";
import {
  computeMatch,
  rankJobsForStudent,
  rankStudentsForJob,
  MATCH_WEIGHTS,
  type MatchSignals,
} from "@/lib/matching/engine";
import type { Job, StudentProfile } from "@/lib/types";

const baseSignals: MatchSignals = {
  studentSkills: ["React", "Next.js", "Python"],
  jobSkills: ["React", "Next.js", "Python"],
  studentHourlyFrom: 400,
  jobBudgetMin: 4_000,
  jobBudgetMax: 8_000,
  deadlineDays: 5,
  trustScore: 80,
  isAvailable: true,
  activeOrderCount: 0,
  sameCategory: true,
};

describe("MATCH_WEIGHTS", () => {
  it("weights sum to 1.0", () => {
    const total = Object.values(MATCH_WEIGHTS).reduce((s, w) => s + w, 0);
    expect(total).toBeCloseTo(1.0, 5);
  });
});

describe("computeMatch", () => {
  it("perfect alignment scores 100", () => {
    const r = computeMatch({
      ...baseSignals,
      studentSkills: ["React", "Next.js", "Python"],
      jobSkills: ["React", "Next.js", "Python"],
      // Tune hourly so expected cost (200 * 30h = 6,000) lands inside the band.
      studentHourlyFrom: 200,
      jobBudgetMin: 4_000,
      jobBudgetMax: 8_000,
      deadlineDays: 5,
      trustScore: 100,
      isAvailable: true,
      activeOrderCount: 0,
    });
    expect(r.score).toBe(100);
    expect(r.components).toHaveLength(4);
  });

  it("zero skill overlap zeroes the skill component", () => {
    const r = computeMatch({
      ...baseSignals,
      studentSkills: ["Cooking"],
      jobSkills: ["React", "Python"],
      sameCategory: false,
    });
    const skill = r.components.find((c) => c.key === "skill")!;
    expect(skill.value).toBe(0);
  });

  it("partial skill overlap with same-category gets a small bonus", () => {
    const r = computeMatch({
      ...baseSignals,
      studentSkills: ["React"],
      jobSkills: ["React", "Vue", "Angular"],
      sameCategory: true,
    });
    const skill = r.components.find((c) => c.key === "skill")!;
    // 1/3 = 33% + 8 same-cat bonus = 41
    expect(skill.value).toBe(41);
  });

  it("availability=false zeroes the availability component", () => {
    const r = computeMatch({ ...baseSignals, isAvailable: false });
    const avail = r.components.find((c) => c.key === "availability")!;
    expect(avail.value).toBe(0);
  });

  it("3+ active orders halves availability", () => {
    const r = computeMatch({ ...baseSignals, activeOrderCount: 3 });
    const avail = r.components.find((c) => c.key === "availability")!;
    expect(avail.value).toBe(50);
  });

  it("budget fit inside band scores 100", () => {
    const r = computeMatch({
      ...baseSignals,
      studentHourlyFrom: 200,
      jobBudgetMin: 4_000,
      jobBudgetMax: 8_000,
      deadlineDays: 5,
    });
    const budget = r.components.find((c) => c.key === "budget")!;
    expect(budget.value).toBe(100);
  });

  it("budget far outside band scores low", () => {
    const r = computeMatch({
      ...baseSignals,
      studentHourlyFrom: 5_000, // 5000 * 30h = 150k vs band of 4-8k
      jobBudgetMin: 4_000,
      jobBudgetMax: 8_000,
      deadlineDays: 5,
    });
    const budget = r.components.find((c) => c.key === "budget")!;
    expect(budget.value).toBeLessThan(50);
  });

  it("trust component equals the trust score", () => {
    const r = computeMatch({ ...baseSignals, trustScore: 72 });
    const trust = r.components.find((c) => c.key === "trust")!;
    expect(trust.value).toBe(72);
  });

  it("each component contribution equals value * weight", () => {
    const r = computeMatch(baseSignals);
    for (const c of r.components) {
      expect(c.contribution).toBeCloseTo(c.value * c.weight, 5);
    }
  });

  it("final score equals sum of contributions, rounded", () => {
    const r = computeMatch(baseSignals);
    const sum = r.components.reduce((s, c) => s + c.contribution, 0);
    expect(r.score).toBe(Math.round(sum * 10) / 10);
  });
});

const student = (
  partial: Partial<StudentProfile> = {}
): StudentProfile => ({
  id: "stu-1",
  fullName: "Test Student",
  username: "test",
  avatarInitials: "TS",
  college: "Test U",
  stream: "CS",
  city: "Mumbai",
  yearOfStudy: 3,
  headline: "h",
  bio: "b",
  skills: ["React"],
  categorySlug: "tech-development",
  trustScore: 70,
  trustTier: "silver",
  rating: 4.5,
  reviewsCount: 5,
  jobsCompleted: 5,
  verified: true,
  hourlyFrom: 400,
  isAvailable: true,
  activeOrderCount: 0,
  ...partial,
});

const job = (partial: Partial<Job> = {}): Job => ({
  id: "job-1",
  clientId: "cli-1",
  title: "test",
  description: "d",
  categorySlug: "tech-development",
  budgetMin: 4_000,
  budgetMax: 8_000,
  deadlineDays: 5,
  skills: ["React"],
  status: "open",
  proposalsCount: 0,
  createdAgo: "now",
  ...partial,
});

describe("rankJobsForStudent", () => {
  it("ranks jobs descending by score", () => {
    // Student hourly Rs.400 * 30h = Rs.12k expected cost; j2 fits, j3 fits less.
    const me = student({ hourlyFrom: 400 });
    const jobs = [
      job({ id: "j1", skills: ["Cooking"], budgetMin: 10_000, budgetMax: 14_000 }),
      job({ id: "j2", skills: ["React"], budgetMin: 10_000, budgetMax: 14_000 }),
      job({ id: "j3", skills: ["Cooking"], budgetMin: 2_000, budgetMax: 3_000 }),
    ];
    const ranked = rankJobsForStudent(me, jobs);
    expect(ranked[0].job.id).toBe("j2");
    expect(ranked[ranked.length - 1].job.id).toBe("j3");
  });

  it("respects the limit option", () => {
    const me = student();
    const jobs = Array.from({ length: 30 }, (_, i) => job({ id: `j${i}` }));
    const ranked = rankJobsForStudent(me, jobs, { limit: 5 });
    expect(ranked).toHaveLength(5);
  });
});

describe("rankStudentsForJob", () => {
  it("ranks students descending by score", () => {
    const j = job({ skills: ["React"] });
    const students = [
      student({ id: "s1", skills: ["Cooking"], trustScore: 40 }),
      student({ id: "s2", skills: ["React"], trustScore: 90 }),
      student({ id: "s3", skills: ["React"], trustScore: 60 }),
    ];
    const ranked = rankStudentsForJob(j, students);
    expect(ranked[0].student.id).toBe("s2");
    expect(ranked[ranked.length - 1].student.id).toBe("s1");
  });
});
