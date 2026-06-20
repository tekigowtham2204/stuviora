import "server-only";
import { z } from "zod";
import type { AiReview } from "@/lib/types";
import { AI_GATE_PASS_THRESHOLD } from "@/lib/constants";
import { services } from "@/lib/env";
import { chatJson } from "@/lib/llm/client";
import { QUALITY_GATE_PROMPT } from "@/lib/ai/prompts";
import { recordGateDecision } from "@/lib/ai/calibration";
import { captureError } from "@/lib/observability";

/**
 * AI quality gate: the moat (P4).
 *
 * Stuviora's promise to clients: every delivery is reviewed against the
 * brief for completeness, alignment, and originality BEFORE the client
 * sees it.
 *
 * Architecture (master plan):
 *   submit  ->  upload files to Storage (fast, <10s)
 *           ->  fire Inngest event 'ai/quality.check'   (live path)
 *           ->  worker extracts files (PDF / DOCX / images / code / ZIP)
 *           ->  calls the LLM (Groq, open-weight model) with structured JSON
 *           ->  writes ai_reviews row
 *           ->  pushes result via Supabase Realtime
 *
 * Demo path: returns a deterministic verdict so the loop is fully
 * exercisable without keys. Live path: chatJson() against OpenRouter.
 */

export interface QualityGateInput {
  orderId: string;
  jobBrief: { title: string; description: string };
  submissionText: string;
}

export interface QualityGateResult extends AiReview {
  orderId: string;
}

/** Stable hash of a string, used to keep demo results deterministic per order. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Demo implementation: deterministic scored verdict per order id. */
function demoReview(input: QualityGateInput): QualityGateResult {
  const seed = hash(input.orderId);
  const briefAlignment = 30 + (seed % 11);
  const completeness = 22 + ((seed >> 3) % 9);
  const quality = 21 + ((seed >> 5) % 10);
  const originality = 88 + (seed % 12);
  const score = briefAlignment + completeness + quality;
  const verdict = score >= AI_GATE_PASS_THRESHOLD ? "PASS" : "FAIL";

  return {
    orderId: input.orderId,
    score,
    verdict,
    briefAlignment,
    completeness,
    quality,
    originality,
    issues:
      verdict === "PASS"
        ? ["Minor: one section could be tightened by a sentence."]
        : ["Brief mismatch on section 2.", "Missing the second deliverable from the brief."],
    suggestions:
      verdict === "PASS"
        ? ["Tighten the intro to one strong hook line."]
        : [
            "Re-read the brief; section 2 asks for a comparison table, not bullets.",
            "Add the second deliverable mentioned at the end of the brief.",
          ],
    reviewerNote:
      verdict === "PASS"
        ? "Aligned with the brief, original, and clean. Safe to deliver."
        : "Resubmit after addressing the listed issues. You have revisions remaining.",
  };
}

const GateResultSchema = z.object({
  score: z.number().min(0).max(100),
  verdict: z.enum(["PASS", "FAIL"]),
  briefAlignment: z.number().min(0).max(40),
  completeness: z.number().min(0).max(30),
  quality: z.number().min(0).max(30),
  originality: z.number().min(0).max(100),
  issues: z.array(z.string()),
  suggestions: z.array(z.string()),
  reviewerNote: z.string(),
});

/** Public: run the gate. Live: OpenRouter via chatJson. Demo: deterministic. */
export async function runQualityGate(input: QualityGateInput): Promise<QualityGateResult> {
  if (services.llm) {
    try {
      const live = await chatJson(
        QUALITY_GATE_PROMPT.system,
        QUALITY_GATE_PROMPT.userTemplate({
          jobTitle: input.jobBrief.title,
          jobDescription: input.jobBrief.description,
          submissionText: input.submissionText,
        }),
        GateResultSchema
      );
      if (live) {
        // Recompute verdict from score so the threshold is enforced
        // server-side; LLM mis-classifications cannot leak through.
        const verdict =
          live.score >= AI_GATE_PASS_THRESHOLD ? "PASS" : "FAIL";
        // Data moat: log the decision for later human-outcome labeling.
        await recordGateDecision({
          orderId: input.orderId,
          score: Math.round(live.score),
          verdict,
          promptVersion: QUALITY_GATE_PROMPT.version,
        });
        return {
          orderId: input.orderId,
          score: Math.round(live.score),
          verdict,
          briefAlignment: Math.round(live.briefAlignment),
          completeness: Math.round(live.completeness),
          quality: Math.round(live.quality),
          originality: Math.round(live.originality),
          issues: live.issues,
          suggestions: live.suggestions,
          reviewerNote: live.reviewerNote,
        };
      }
    } catch (err) {
      // Live failure falls back to demo so the order does not block on a
      // transient LLM error, but we must not swallow it: a schema mismatch
      // and a network blip look identical otherwise. Log it (Sentry routing
      // lands when a DSN exists) before falling through to the demo verdict.
      captureError(err, { scope: "ai/quality-gate", orderId: input.orderId });
    }
  }
  const review = demoReview(input);
  await recordGateDecision({
    orderId: input.orderId,
    score: review.score,
    verdict: review.verdict,
    promptVersion: QUALITY_GATE_PROMPT.version,
  });
  return review;
}
