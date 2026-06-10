/**
 * Demo-mode mutable state (Sprint 5b).
 *
 * In-memory stores that let demo-mode Server Actions feel real within a
 * server process: saved jobs, proposal templates, blocked clients, and
 * dispute appeals. Live mode persists the same concepts to the tables in
 * migration 0010 and never touches these.
 */

export interface ProposalTemplate {
  id: string;
  studentId: string;
  label: string;
  body: string;
  createdAt: number;
}

/** jobIds the demo student saved for later (#40). */
export const savedJobIds = new Set<string>();

/** Saved proposal templates (#43). */
export const proposalTemplates: ProposalTemplate[] = [];

/** clientIds the demo student blocked (#56). */
export const blockedClientIds = new Set<string>();

/** disputeIds appealed within the 7-day window (#55). */
export const appealedDisputeIds = new Set<string>();
