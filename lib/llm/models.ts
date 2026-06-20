import { env } from "@/lib/env";

/**
 * The platform's LLM model tiers, shown in the admin model picker. Labels are
 * tier names; the actual model id (an open-weight model on Groq) is displayed
 * truthfully alongside each, so the UI never claims a model it does not run.
 * Model ids are env-overridable (Groq's catalogue shifts).
 */
export type LlmTierId = "fast" | "balanced" | "max";

export interface LlmTier {
  id: LlmTierId;
  label: string;
  /** The real model id sent to Groq. */
  model: string;
  note: string;
}

export const LLM_TIERS: LlmTier[] = [
  {
    id: "fast",
    label: "Fast",
    model: env.groqModelFast,
    note: "Lowest latency and cost. Good for drafts and extraction.",
  },
  {
    id: "balanced",
    label: "Balanced",
    model: env.groqModelBalanced,
    note: "Default for the quality gate. Strong quality at low cost.",
  },
  {
    id: "max",
    label: "Max",
    model: env.groqModelMax,
    note: "Highest quality for the hardest reviews.",
  },
];

export const DEFAULT_TIER: LlmTierId = "balanced";

/** Resolve the real model id for a tier (falls back to balanced). */
export function modelForTier(id: LlmTierId): string {
  return (LLM_TIERS.find((t) => t.id === id) ?? LLM_TIERS[1]).model;
}
