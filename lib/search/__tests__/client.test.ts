import { describe, it, expect } from "vitest";
import {
  searchDemo,
  studentToSearchDoc,
  jobToSearchDoc,
} from "@/lib/search/client";
import type { Job, StudentProfile } from "@/lib/types";

const student = (p: Partial<StudentProfile> = {}): StudentProfile => ({
  id: "stu-1",
  fullName: "Diya Sharma",
  username: "diya",
  avatarInitials: "DS",
  college: "Lady Shri Ram College",
  stream: "Literature",
  city: "Delhi",
  yearOfStudy: 2,
  headline: "Content writer",
  bio: "I write blog posts and copy.",
  skills: ["Copywriting", "Blogging"],
  categorySlug: "content-writing",
  trustScore: 72,
  trustTier: "silver",
  rating: 4.6,
  reviewsCount: 8,
  jobsCompleted: 10,
  verified: true,
  hourlyFrom: 500,
  isAvailable: true,
  activeOrderCount: 1,
  ...p,
});

const job = (p: Partial<Job> = {}): Job => ({
  id: "job-1",
  clientId: "cli-1",
  title: "Write a blog series",
  description: "Five SEO blog posts on fintech.",
  categorySlug: "content-writing",
  budgetMin: 4000,
  budgetMax: 10000,
  deadlineDays: 7,
  skills: ["Copywriting"],
  status: "open",
  proposalsCount: 2,
  createdAgo: "now",
  ...p,
});

describe("searchDemo", () => {
  it("matches students by skill", () => {
    const hits = searchDemo("copywriting", [student()], [], { q: "copywriting", type: "students" });
    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe("student");
  });

  it("only returns open jobs", () => {
    const closed = job({ status: "closed" });
    const hits = searchDemo("blog", [], [job(), closed], { q: "blog", type: "jobs" });
    expect(hits).toHaveLength(1);
  });

  it("returns nothing for an empty query", () => {
    expect(searchDemo("  ", [student()], [job()])).toHaveLength(0);
  });
});

describe("search document mappers", () => {
  it("maps a student to a search doc with skills and trust", () => {
    const doc = studentToSearchDoc(student());
    expect(doc.id).toBe("stu-1");
    expect(doc.skills).toContain("Copywriting");
    expect(doc.trustScore).toBe(72);
    // PII (city, bio length) is not the index key; identity fields are present.
    expect(doc.username).toBe("diya");
  });

  it("maps a job to a search doc carrying status", () => {
    const doc = jobToSearchDoc(job());
    expect(doc.id).toBe("job-1");
    expect(doc.status).toBe("open");
    expect(doc.title).toContain("blog series");
  });
});
