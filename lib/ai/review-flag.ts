import { ORIGINALITY_REVIEW_THRESHOLD } from "@/lib/constants";

/**
 * Decide whether a delivery should be routed to a human reviewer.
 *
 * This is deliberately ADVISORY: it never changes the PASS/FAIL verdict. The
 * gate scores work against the brief (completeness, alignment, polish); it must
 * not auto-reject work for "reading like AI" or for non-native English, because
 * AI-detection is unreliable and biased against ESL writers. When originality
 * reads low, or the model itself is unsure about authorship, a person looks -
 * the work is not silently failed.
 */
export function shouldFlagForReview(args: {
  /** Originality reading from the gate, 0 to 100. */
  originality: number;
  /** The model explicitly flagged authorship/originality as uncertain. */
  modelFlagged?: boolean;
}): boolean {
  return args.modelFlagged === true || args.originality < ORIGINALITY_REVIEW_THRESHOLD;
}
