import { describe, it, expect } from "vitest";
import { buildProposalVariants } from "@/lib/proposals/variants";
import type { ProposalDraft } from "@/lib/proposals/writer";

const draft = (partial: Partial<ProposalDraft> = {}): ProposalDraft => ({
  greeting: "Hi,",
  hook: "Saw your brief. I can move fast.",
  plan: ["First, a one-page plan.", "Then I deliver in 5 days."],
  close: "My bid: Rs. 5,000. Thanks,\nAarav",
  full: "Hi,\n\nSaw your brief. I can move fast.\n\n- First, a one-page plan.\n- Then I deliver in 5 days.\n\nMy bid: Rs. 5,000. Thanks,\nAarav",
  ...partial,
});

describe("buildProposalVariants", () => {
  it("always offers the balanced draft first", () => {
    const variants = buildProposalVariants(draft());
    expect(variants[0].label).toBe("Balanced");
    expect(variants[0].text).toBe(draft().full);
  });

  it("produces three distinct variants for a full draft", () => {
    const variants = buildProposalVariants(draft());
    expect(variants).toHaveLength(3);
    const texts = new Set(variants.map((v) => v.text));
    expect(texts.size).toBe(3);
  });

  it("the concise variant drops the plan bullets", () => {
    const concise = buildProposalVariants(draft()).find(
      (v) => v.label === "Concise"
    );
    expect(concise).toBeDefined();
    expect(concise!.text).not.toContain("one-page plan");
  });

  it("collapses to a single variant when there is no plan", () => {
    // A planless draft's `full` is just greeting + hook + close, so the
    // concise recombination matches it and is dropped as a duplicate.
    const planless = draft({
      plan: [],
      full: "Hi,\n\nSaw your brief. I can move fast.\n\nMy bid: Rs. 5,000. Thanks,\nAarav",
    });
    const variants = buildProposalVariants(planless);
    expect(variants).toHaveLength(1);
    expect(variants[0].label).toBe("Balanced");
  });
});
