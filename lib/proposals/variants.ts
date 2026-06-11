/**
 * Pure proposal-variant builder (audit #23).
 *
 * The AI writer produces a single structured draft. To let a student
 * cycle through alternatives without a server round-trip, we recombine
 * the draft's parts into a few distinct, valid full-text variants.
 * Deterministic and I/O-free so it works in demo and live alike.
 */

import type { ProposalDraft } from "@/lib/proposals/writer";

export interface ProposalVariant {
  label: string;
  text: string;
}

export function buildProposalVariants(draft: ProposalDraft): ProposalVariant[] {
  const planBlock = draft.plan.map((p) => `- ${p}`).join("\n");

  const balanced = draft.full;

  const concise = [draft.greeting, draft.hook, draft.close]
    .filter(Boolean)
    .join("\n\n");

  const planFirstParts = [draft.greeting];
  if (planBlock) {
    planFirstParts.push(`Here is how I would approach this:\n${planBlock}`);
  }
  planFirstParts.push(draft.hook, draft.close);
  const planFirst = planFirstParts.filter(Boolean).join("\n\n");

  const variants: ProposalVariant[] = [{ label: "Balanced", text: balanced }];
  // Only offer alternatives that genuinely differ from the balanced draft.
  if (concise && concise !== balanced) {
    variants.push({ label: "Concise", text: concise });
  }
  if (planBlock && planFirst !== balanced && planFirst !== concise) {
    variants.push({ label: "Plan-first", text: planFirst });
  }
  return variants;
}
