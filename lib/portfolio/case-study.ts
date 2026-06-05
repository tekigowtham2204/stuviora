/**
 * Portfolio auto-generator (M5.3).
 *
 * Turns a completed order into a draft case-study (problem / approach /
 * outcome). Demo path generates from the brief + AI-review notes; live path
 * calls Claude with a structured prompt and saves the result with
 * `is_published=false` so the student can edit before publishing.
 */

import type { Order, PortfolioItem, Review } from "@/lib/types";

interface BuildCaseStudyInput {
  order: Order;
  /** The skills the student listed for this work (or job skills as fallback). */
  skills: string[];
  /** Optional review left by the client. */
  review?: Review;
}

export async function buildCaseStudyDraft({
  order,
  skills,
  review,
}: BuildCaseStudyInput): Promise<Omit<PortfolioItem, "id" | "studentId">> {
  const headline = order.jobTitle;
  const briefHint = order.aiReview?.reviewerNote ?? "Delivered to brief.";

  const problem = `Client posted "${headline}". The work needed to land on-brief and ship on time.`;

  const approach =
    `Broke the brief into clear milestones, shared a one-page plan, and confirmed scope before starting. ` +
    `Skills applied: ${skills.slice(0, 4).join(", ") || "to be filled in"}.`;

  const outcome = review
    ? `Client rated the work ${review.rating} of 5: "${review.comment}"`
    : `${briefHint} ` +
      (order.aiReview ? `AI gate score: ${order.aiReview.score}/100.` : "Approved without revisions.");

  return {
    title: headline,
    problem,
    approach,
    outcome,
    skills,
  };
}
