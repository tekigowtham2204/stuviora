import { describe, it, expect } from "vitest";
import {
  questionsFor,
  gradeAssessment,
  assessableCategories,
  PASS_THRESHOLD,
  QUESTIONS_PER_TEST,
} from "@/lib/skills/assessment";

describe("skill assessment", () => {
  it("covers all six service categories with 5 questions each", () => {
    const cats = assessableCategories();
    expect(cats).toHaveLength(6);
    for (const c of cats) {
      expect(questionsFor(c)).toHaveLength(QUESTIONS_PER_TEST);
    }
  });

  it("never ships the answer key to the client", () => {
    const qs = questionsFor("tech-development")!;
    for (const q of qs) {
      expect(q).not.toHaveProperty("answer");
    }
  });

  it("grades a perfect submission as a pass", () => {
    // Reconstruct correct answers via grading single-answer probes.
    const qs = questionsFor("data-ai")!;
    const answers: Record<string, number> = {};
    for (const q of qs) {
      for (let i = 0; i < q.options.length; i++) {
        const r = gradeAssessment("data-ai", { [q.id]: i })!;
        if (r.correct === 1) {
          answers[q.id] = i;
          break;
        }
      }
    }
    const result = gradeAssessment("data-ai", answers)!;
    expect(result.correct).toBe(QUESTIONS_PER_TEST);
    expect(result.passed).toBe(true);
  });

  it("fails below the threshold and handles unknown categories", () => {
    const r = gradeAssessment("content-copywriting", {})!;
    expect(r.correct).toBe(0);
    expect(r.passed).toBe(false);
    expect(PASS_THRESHOLD).toBeLessThanOrEqual(QUESTIONS_PER_TEST);
    expect(gradeAssessment("nope", {})).toBeNull();
  });
});
