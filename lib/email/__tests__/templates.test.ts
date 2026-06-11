import { describe, it, expect } from "vitest";
import {
  inr,
  welcomeEmail,
  collegeVerifyEmail,
  orderHiredEmail,
  orderSubmittedEmail,
  payoutSettledEmail,
  weeklyDigestEmail,
  matchAlertEmail,
  type EmailMessage,
} from "@/lib/email/templates";

const DASH = /[\u2013\u2014]/; // en/em dash (hard ban in user copy)

const all: EmailMessage[] = [
  welcomeEmail({ name: "Diya" }),
  collegeVerifyEmail({ name: "Diya", code: "428913" }),
  orderHiredEmail({ studentName: "Aarav", jobTitle: "Logo redesign", amount: 6000, orderId: "ord_1" }),
  orderSubmittedEmail({ clientName: "Priya", jobTitle: "Logo redesign", orderId: "ord_1" }),
  payoutSettledEmail({ studentName: "Aarav", amount: 5100, orderTitle: "Logo redesign" }),
  weeklyDigestEmail({ name: "Aarav", completedCount: 2, earned: 10200, newMatches: 5 }),
  matchAlertEmail({ name: "Diya", jobTitle: "Blog series", matchScore: 87.4, jobId: "job_1" }),
];

describe("email templates", () => {
  it("every template renders a non-empty subject, html and text", () => {
    for (const m of all) {
      expect(m.subject.length).toBeGreaterThan(0);
      expect(m.html).toContain("<!doctype html>");
      expect(m.text.length).toBeGreaterThan(0);
    }
  });

  it("never uses em-dashes or en-dashes in any rendered field", () => {
    for (const m of all) {
      expect(DASH.test(m.subject), `subject: ${m.subject}`).toBe(false);
      expect(DASH.test(m.html), `html for: ${m.subject}`).toBe(false);
      expect(DASH.test(m.text), `text for: ${m.subject}`).toBe(false);
    }
  });

  it("formats rupees the Indian way without decimals", () => {
    expect(inr(1234567)).toBe("Rs.12,34,567");
    expect(inr(5100.6)).toBe("Rs.5,101");
  });

  it("surfaces the verification code in subject and body", () => {
    const m = collegeVerifyEmail({ name: "Diya", code: "428913" });
    expect(m.subject).toContain("428913");
    expect(m.html).toContain("428913");
    expect(m.text).toContain("428913");
  });

  it("includes the rounded match score in the alert", () => {
    const m = matchAlertEmail({ name: "Diya", jobTitle: "Blog series", matchScore: 87.4, jobId: "job_1" });
    expect(m.subject).toContain("Blog series");
    expect(m.text).toContain("87");
  });

  it("shows the payout amount in the settled email", () => {
    const m = payoutSettledEmail({ studentName: "Aarav", amount: 5100, orderTitle: "X" });
    expect(m.subject).toContain("Rs.5,100");
  });
});
