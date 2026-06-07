import { describe, it, expect } from "vitest";
import {
  studentFromRow,
  clientFromRow,
  jobFromRow,
  proposalFromRow,
  orderFromRow,
  initialsOf,
  asNumber,
  agoOf,
} from "@/lib/data/mappers";

describe("initialsOf", () => {
  it("returns first letter of each of the first two words, uppercased", () => {
    expect(initialsOf("Aarav Mehta")).toBe("AM");
    expect(initialsOf("Diya Sharma Kumar")).toBe("DS");
    expect(initialsOf("Cher")).toBe("C");
  });

  it("returns ? for empty / whitespace input", () => {
    expect(initialsOf("")).toBe("?");
    expect(initialsOf("   ")).toBe("?");
  });
});

describe("asNumber", () => {
  it("passes numbers through", () => {
    expect(asNumber(42)).toBe(42);
  });

  it("parses numeric strings (Supabase numeric columns)", () => {
    expect(asNumber("42.5")).toBe(42.5);
  });
});

describe("agoOf", () => {
  const now = new Date("2026-06-01T12:00:00.000Z");

  it.each([
    [new Date("2026-06-01T11:59:50.000Z"), "just now"],
    [new Date("2026-06-01T11:55:00.000Z"), "5m ago"],
    [new Date("2026-06-01T09:00:00.000Z"), "3h ago"],
    [new Date("2026-05-30T12:00:00.000Z"), "2d ago"],
    [new Date("2026-05-15T12:00:00.000Z"), "2w ago"],
    [new Date("2026-03-01T12:00:00.000Z"), "3mo ago"],
    [new Date("2024-06-01T12:00:00.000Z"), "2y ago"],
  ])("formats %s as %s", (date, expected) => {
    expect(agoOf(date.toISOString(), now)).toBe(expected);
  });
});

describe("studentFromRow", () => {
  it("maps a happy joined row", () => {
    const s = studentFromRow({
      id: "stu-1",
      full_name: "Aarav Mehta",
      username: "aaravmehta",
      stream: "Computer Science",
      city: "Mumbai",
      year_of_study: 3,
      headline: "Full-stack dev",
      bio: "bio",
      trust_score: 82.5,
      trust_tier: "gold",
      jobs_completed: 14,
      is_available: true,
      kyc: "verified",
      college_name: "IIT Bombay",
      category_slug: "tech-development",
      skills: ["React", "Next.js"],
      hourly_from: 400,
      rating_avg: 4.83,
      rating_count: 11,
      active_order_count: 1,
      median_response_hours: 3,
    });
    expect(s.id).toBe("stu-1");
    expect(s.fullName).toBe("Aarav Mehta");
    expect(s.avatarInitials).toBe("AM");
    expect(s.trustScore).toBe(82.5);
    expect(s.trustTier).toBe("gold");
    expect(s.verified).toBe(true);
    expect(s.rating).toBe(4.8); // round to 1 dp
    expect(s.skills).toEqual(["React", "Next.js"]);
  });

  it("handles null-heavy live rows gracefully", () => {
    const s = studentFromRow({
      id: "stu-2",
      full_name: null,
      username: null,
      stream: null,
      city: null,
      year_of_study: null,
      headline: null,
      bio: null,
      trust_score: "0",
      trust_tier: "bronze",
      jobs_completed: 0,
      is_available: true,
      kyc: "none",
    });
    expect(s.fullName).toBe("Student");
    expect(s.username).toBe("stu-2"); // first 8 chars of id, no real username
    expect(s.verified).toBe(false);
    expect(s.skills).toEqual([]);
    expect(s.activeOrderCount).toBe(0);
    expect(s.medianResponseHours).toBeUndefined();
  });
});

describe("clientFromRow", () => {
  it("uses company_name for initials when available", () => {
    const c = clientFromRow({
      id: "cli-1",
      full_name: "Priya Nair",
      company_name: "Brewhaus Coffee Co.",
      city: "Bengaluru",
      jobs_posted: 3,
    });
    expect(c.avatarInitials).toBe("BC");
    expect(c.companyName).toBe("Brewhaus Coffee Co.");
  });

  it("falls back to full_name when company is null", () => {
    const c = clientFromRow({
      id: "cli-2",
      full_name: "Priya Nair",
      company_name: null,
      city: null,
      jobs_posted: 0,
    });
    expect(c.companyName).toBe("Priya Nair");
    expect(c.avatarInitials).toBe("PN");
  });
});

describe("jobFromRow", () => {
  it("formats created_ago", () => {
    const now = new Date("2026-06-01T12:00:00.000Z");
    const j = jobFromRow({
      id: "job-1",
      client_id: "cli-1",
      title: "Test",
      description: "d",
      category_slug: "tech-development",
      budget_min: "4000",
      budget_max: "8000",
      deadline_days: 5,
      status: "open",
      proposals_count: 3,
      created_at: new Date(now.getTime() - 2 * 3600_000).toISOString(),
      skills: ["React"],
    });
    expect(j.budgetMin).toBe(4000);
    expect(j.budgetMax).toBe(8000);
    expect(j.skills).toEqual(["React"]);
  });
});

describe("proposalFromRow", () => {
  it("converts numeric bid_amount string to number", () => {
    const p = proposalFromRow({
      id: "p1",
      job_id: "j1",
      student_id: "s1",
      cover_letter: "hi",
      bid_amount: "6000",
      delivery_days: 4,
      status: "submitted",
    });
    expect(p.bidAmount).toBe(6000);
  });
});

describe("orderFromRow", () => {
  it("renders approvedAgo when present, omits otherwise", () => {
    // orderFromRow uses agoOf() which reads new Date() internally; we
    // therefore anchor everything against the wall clock.
    const baseRow = {
      id: "o1",
      job_id: "j1",
      client_id: "c1",
      student_id: "s1",
      amount: "5000",
      status: "completed" as const,
      deadline_days: 0,
      created_at: new Date(Date.now() - 86400_000).toISOString(),
      job_title: "T",
    };
    const approved = orderFromRow({
      ...baseRow,
      approved_at: new Date(Date.now() - 3600_000).toISOString(),
    });
    expect(approved.approvedAgo).toBeDefined();
    expect(approved.createdAgo).toBeDefined();

    const open = orderFromRow({
      ...baseRow,
      id: "o2",
      status: "active",
      approved_at: null,
    });
    expect(open.approvedAgo).toBeUndefined();
  });
});
