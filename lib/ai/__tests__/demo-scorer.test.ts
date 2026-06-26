import { describe, it, expect } from "vitest";
import { scoreDemoGate } from "@/lib/ai/demo-scorer";
import { AI_GATE_PASS_THRESHOLD } from "@/lib/constants";

const baseInput = {
  seed: "demo-1",
  jobTitle: "Write a 500-word blog on freelance trends",
  jobDescription: "We need a 500-word post for our SMB audience with stats.",
};

describe("scoreDemoGate", () => {
  it("empty submission fails the gate", () => {
    const r = scoreDemoGate({ ...baseInput, submissionText: "" });
    expect(r.verdict).toBe("FAIL");
    expect(r.score).toBeLessThan(AI_GATE_PASS_THRESHOLD);
    expect(r.issues.length).toBeGreaterThan(0);
  });

  it("substantial submission passes the gate", () => {
    const longText = "A ".repeat(400) + "comprehensive draft of the blog.";
    const r = scoreDemoGate({ ...baseInput, submissionText: longText });
    expect(r.verdict).toBe("PASS");
    expect(r.score).toBeGreaterThanOrEqual(AI_GATE_PASS_THRESHOLD);
  });

  it("is deterministic for the same input", () => {
    const a = scoreDemoGate({ ...baseInput, submissionText: "Same draft text." });
    const b = scoreDemoGate({ ...baseInput, submissionText: "Same draft text." });
    expect(a).toEqual(b);
  });

  it("never returns dimensions out of bounds", () => {
    const r = scoreDemoGate({ ...baseInput, submissionText: "Mid-length draft." });
    expect(r.briefAlignment).toBeLessThanOrEqual(40);
    expect(r.completeness).toBeLessThanOrEqual(30);
    expect(r.quality).toBeLessThanOrEqual(30);
    expect(r.originality).toBeLessThanOrEqual(100);
  });
});
