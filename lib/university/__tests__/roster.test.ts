import { describe, it, expect } from "vitest";
import { earningsBand, buildRoster } from "@/lib/university/roster";
import type { StudentProfile } from "@/lib/types";

const student = (id: string, p: Partial<StudentProfile> = {}): StudentProfile => ({
  id,
  fullName: `Student ${id}`,
  username: id,
  avatarInitials: "SS",
  college: "IIT Bombay",
  stream: "CS",
  city: "Mumbai",
  yearOfStudy: 2,
  headline: "",
  bio: "",
  skills: [],
  categorySlug: "tech-development",
  trustScore: 50,
  trustTier: "bronze",
  rating: 0,
  reviewsCount: 0,
  jobsCompleted: 0,
  verified: true,
  hourlyFrom: 300,
  isAvailable: true,
  activeOrderCount: 0,
  ...p,
});

describe("earningsBand", () => {
  it("bands amounts coarsely and never shows an exact figure", () => {
    expect(earningsBand(0)).toBe("No earnings yet");
    expect(earningsBand(4999)).toBe("Under Rs.5,000");
    expect(earningsBand(5000)).toBe("Rs.5,000 to Rs.20,000");
    expect(earningsBand(25000)).toBe("Rs.20,000 to Rs.50,000");
    expect(earningsBand(80000)).toBe("Rs.50,000+");
  });
});

describe("buildRoster", () => {
  const students = [student("a"), student("b"), student("c")];
  const consented = new Set(["a", "c"]);
  const earned = (id: string) => (id === "a" ? 12000 : 0);

  it("includes only opted-in students (privacy)", () => {
    const roster = buildRoster(students, consented, earned);
    expect(roster.map((r) => r.username).sort()).toEqual(["a", "c"]);
    expect(roster.find((r) => r.username === "b")).toBeUndefined();
  });

  it("marks activation and bands earnings", () => {
    const roster = buildRoster(students, consented, earned);
    const a = roster.find((r) => r.username === "a")!;
    const c = roster.find((r) => r.username === "c")!;
    expect(a.activated).toBe(true);
    expect(a.earningsBand).toBe("Rs.5,000 to Rs.20,000");
    expect(c.activated).toBe(false);
    expect(c.earningsBand).toBe("No earnings yet");
  });

  it("returns an empty roster when nobody opted in", () => {
    expect(buildRoster(students, new Set(), earned)).toHaveLength(0);
  });
});
