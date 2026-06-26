import { describe, it, expect } from "vitest";
import { shouldFlagForReview } from "@/lib/ai/review-flag";
import { ORIGINALITY_REVIEW_THRESHOLD } from "@/lib/constants";

describe("shouldFlagForReview", () => {
  it("does not flag high-originality work", () => {
    expect(shouldFlagForReview({ originality: 95 })).toBe(false);
  });

  it("flags work below the originality threshold", () => {
    expect(
      shouldFlagForReview({ originality: ORIGINALITY_REVIEW_THRESHOLD - 1 })
    ).toBe(true);
  });

  it("does not flag work exactly at the threshold", () => {
    expect(
      shouldFlagForReview({ originality: ORIGINALITY_REVIEW_THRESHOLD })
    ).toBe(false);
  });

  it("flags when the model itself is unsure, even at high originality", () => {
    expect(
      shouldFlagForReview({ originality: 99, modelFlagged: true })
    ).toBe(true);
  });

  it("modelFlagged false behaves like omitted", () => {
    expect(
      shouldFlagForReview({ originality: 90, modelFlagged: false })
    ).toBe(false);
  });
});
