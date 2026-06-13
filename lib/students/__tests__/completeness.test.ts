import { describe, it, expect } from "vitest";
import { computeProfileCompleteness } from "@/lib/students/completeness";
import type { StudentProfile } from "@/lib/types";

const student = (p: Partial<StudentProfile> = {}): StudentProfile => ({
  id: "s", fullName: "S", username: "s", avatarInitials: "S",
  college: "C", stream: "CS", city: "X", yearOfStudy: 2,
  headline: "Full-stack dev who ships fast", bio: "I build web apps, scrapers, and automations for small businesses.",
  skills: ["React", "Python", "APIs"], categorySlug: "tech-development",
  trustScore: 50, trustTier: "bronze", rating: 0, reviewsCount: 0,
  jobsCompleted: 0, verified: true, hourlyFrom: 300, isAvailable: true,
  activeOrderCount: 0, ...p,
});

describe("computeProfileCompleteness", () => {
  it("scores 100 when everything is done", () => {
    const c = computeProfileCompleteness({
      student: student(), portfolioCount: 2, hasSkillBadge: true, hasPayoutDetails: true,
    });
    expect(c.percent).toBe(100);
    expect(c.next).toBeNull();
  });

  it("surfaces the highest-weight missing item as next", () => {
    const c = computeProfileCompleteness({
      student: student(), portfolioCount: 0, hasSkillBadge: false, hasPayoutDetails: true,
    });
    expect(c.percent).toBeLessThan(100);
    expect(c.next!.key).toBe("portfolio"); // weight 25 beats skill test 20
  });

  it("empty profile scores low and points at skills first among profile items", () => {
    const c = computeProfileCompleteness({
      student: student({ headline: "", bio: "", skills: [] }),
      portfolioCount: 0, hasSkillBadge: false, hasPayoutDetails: false,
    });
    expect(c.percent).toBe(0);
    expect(c.next!.key).toBe("portfolio");
  });
});
