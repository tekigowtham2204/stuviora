/**
 * Portfolio auto-generator (P4 live).
 *
 * Turns a completed order into a draft case-study (problem / approach /
 * outcome). Live: OpenRouter call. Demo: deterministic Markdown.
 * Output saved to portfolio_items with is_published=false so the
 * student can edit before publishing.
 */

import "server-only";
import { z } from "zod";
import type { Order, PortfolioItem, Review } from "@/lib/types";
import { services } from "@/lib/env";
import { chatJson } from "@/lib/llm/client";
import { CASE_STUDY_PROMPT } from "@/lib/ai/prompts";

interface BuildCaseStudyInput {
  order: Order;
  skills: string[];
  review?: Review;
}

const CaseStudySchema = z.object({
  title: z.string(),
  problem: z.string(),
  approach: z.string(),
  outcome: z.string(),
});

export async function buildCaseStudyDraft({
  order,
  skills,
  review,
}: BuildCaseStudyInput): Promise<Omit<PortfolioItem, "id" | "studentId">> {
  if (services.llm) {
    try {
      const live = await chatJson(
        CASE_STUDY_PROMPT.system,
        CASE_STUDY_PROMPT.userTemplate({
          jobTitle: order.jobTitle,
          jobDescription: order.jobTitle,
          submissionSummary: order.aiReview?.reviewerNote ?? "Delivered to brief.",
          aiScore: order.aiReview?.score,
          review: review
            ? { rating: review.rating, comment: review.comment }
            : undefined,
          skills: skills.join(", "),
        }),
        CaseStudySchema
      );
      if (live) {
        return {
          title: live.title,
          problem: live.problem,
          approach: live.approach,
          outcome: live.outcome,
          skills,
        };
      }
    } catch {
      // fall through
    }
  }

  // Demo / fallback.
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
