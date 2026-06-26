import { AI_GATE_PASS_THRESHOLD } from "@/lib/constants";

/**
 * Client-safe deterministic mirror of lib/ai/quality-gate.ts demoReview.
 *
 * Same scoring shape as the server demo path, with no I/O and no
 * server-only marker, so it can render an interactive "try the gate"
 * widget in the browser. The /vision page uses this to make the moat
 * tangible: an investor pastes a brief + a draft and sees the gate
 * score it the same way it would score a real submission.
 *
 * Honesty rule: surfaces using this function MUST label the result as
 * the demo scorer, never claim it is the production LLM.
 */

export interface DemoGateInput {
  /** Stable seed; the order id when running against a real order, or any string. */
  seed: string;
  jobTitle: string;
  jobDescription: string;
  submissionText: string;
}

export interface DemoGateResult {
  score: number;
  verdict: "PASS" | "FAIL";
  briefAlignment: number; // /40
  completeness: number; // /30
  quality: number; // /30
  originality: number; // /100
  issues: string[];
  suggestions: string[];
  reviewerNote: string;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

export function scoreDemoGate(input: DemoGateInput): DemoGateResult {
  const seed = hash(input.seed + input.jobTitle);
  // Length of the submission stands in for "how much real work was sent".
  const len = input.submissionText.trim().length;
  const f = clamp(len / 220, 0, 1);
  const briefAlignment = clamp(
    Math.round(16 + f * 22 + (seed % 3)),
    0,
    40,
  );
  const completeness = clamp(
    Math.round(11 + f * 17 + ((seed >> 3) % 3)),
    0,
    30,
  );
  const quality = clamp(Math.round(12 + f * 16 + ((seed >> 5) % 3)), 0, 30);
  const originality = 88 + (seed % 12);
  const score = briefAlignment + completeness + quality;
  const verdict: "PASS" | "FAIL" =
    score >= AI_GATE_PASS_THRESHOLD ? "PASS" : "FAIL";

  return {
    score,
    verdict,
    briefAlignment,
    completeness,
    quality,
    originality,
    issues:
      verdict === "PASS"
        ? ["Minor: one section could be tightened by a sentence."]
        : [
            "Brief mismatch on section 2.",
            "Missing the second deliverable from the brief.",
          ],
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
