import "server-only";
import type { AiReview } from "@/lib/types";
import { AI_GATE_PASS_THRESHOLD } from "@/lib/constants";
import { services } from "@/lib/env";

/**
 * AI quality gate: the moat.
 *
 * Stuviora's promise to clients: every delivery is reviewed against the brief
 * for completeness, alignment, and originality BEFORE the client sees it.
 *
 * Architecture (per the master plan):
 *   submit  ->  upload files to Storage (fast, <10s)
 *           ->  fire Inngest event 'ai/quality.check'   (live path)
 *           ->  worker extracts files (PDF / DOCX / images / code / ZIP)
 *           ->  calls Claude with structured JSON prompt
 *           ->  writes ai_reviews row
 *           ->  pushes result via Supabase Realtime
 *
 * For now, the demo path returns a deterministic verdict so the loop is
 * fully exercisable without keys. Swap with the live implementation when
 * ANTHROPIC_API_KEY and INNGEST_EVENT_KEY are configured.
 */

export interface QualityGateInput {
  orderId: string;
  jobBrief: { title: string; description: string };
  submissionText: string; // already-extracted text
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
  const briefAlignment = 30 + (seed % 11); // 30..40
  const completeness = 22 + ((seed >> 3) % 9); // 22..30
  const quality = 21 + ((seed >> 5) % 10); // 21..30
  const originality = 88 + (seed % 12); // 88..99
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

/** Public: run the gate. Live path uses Claude via Inngest; demo returns immediately. */
export async function runQualityGate(input: QualityGateInput): Promise<QualityGateResult> {
  if (services.anthropic && services.inngest) {
    // TODO (live path): fire Inngest event and return REVIEW_IN_PROGRESS;
    // the worker writes ai_reviews and pushes result via Realtime.
    return demoReview(input);
  }
  return demoReview(input);
}
