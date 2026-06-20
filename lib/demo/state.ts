/**
 * Demo-mode mutable state (Sprint 5b).
 *
 * In-memory stores that let demo-mode Server Actions feel real within a
 * server process: saved jobs, proposal templates, blocked clients, and
 * dispute appeals. Live mode persists the same concepts to the tables in
 * migration 0010 and never touches these.
 */
import type { ExportDestination } from "@/lib/export/plan";

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

/** Category slugs where the demo student passed the skill test (#11). */
export const passedSkillBadges = new Set<string>();

/** User reports filed in demo mode (#61). */
export interface UserReport {
  id: string;
  reporterId: string;
  targetName: string;
  context: string;
  reason: string;
  createdAt: number;
}
export const userReports: UserReport[] = [];

/** Saved search filters (#21): category slugs the student saved. */
export const savedSearches = new Set<string>();

/** Auto-withdraw threshold in rupees; null = off (#34). */
export const autoWithdraw: { threshold: number | null } = { threshold: null };

/** Imported portfolio drafts awaiting publish (#37/#38). */
export interface PortfolioDraft {
  id: string;
  title: string;
  outcome: string;
  source: "github" | "profile";
}
export const portfolioDrafts: PortfolioDraft[] = [];

/**
 * Auto-export of delivered work (features.md 2026-06-18). Destinations the
 * student has connected, and the orders whose client granted a public
 * portfolio license. Demo defaults: the on-platform portfolio is connected;
 * no client has licensed raw public sharing yet.
 */
export const connectedExportDestinations = new Set<ExportDestination>(["portfolio"]);
export const autoExport: { enabled: boolean } = { enabled: true };
/** Order ids the client marked shareable (raw work may go public). */
export const shareableOrderIds = new Set<string>();

