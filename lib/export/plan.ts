/**
 * Auto-export plan engine (the consent guardrail, in pure logic).
 *
 * When a student's order completes, their work can be archived to their
 * connected destinations. The hard rule: raw client-owned deliverables may
 * go to PRIVATE destinations (the freelancer keeping their own copy), but
 * they only reach PUBLIC destinations when the client has explicitly marked
 * the order shareable / granted a portfolio license. Otherwise a public
 * destination receives the IP-safe case-study summary, never the raw files.
 *
 * Pure + deterministic: no I/O, no keys. The dispatcher (lib/export/dispatch)
 * executes whatever this returns.
 */

export type ExportDestination = "github" | "drive" | "notion" | "portfolio";

export type ExportVisibility = "private" | "public";

/** What a destination exposes by nature. Repos/drives/notion default to
 *  private; the on-platform portfolio page is inherently public. */
export const DESTINATION_VISIBILITY: Record<ExportDestination, ExportVisibility> = {
  github: "private",
  drive: "private",
  notion: "private",
  portfolio: "public",
};

export interface ExportPlanInput {
  /** Only export once the order is actually done (AI-gate pass + approval + payout). */
  orderCompleted: boolean;
  /** Destinations the student has connected + enabled. */
  connected: ExportDestination[];
  /** The client granted a public/portfolio license for this order's work. */
  clientShareable: boolean;
}

export interface ExportAction {
  destination: ExportDestination;
  /** Raw deliverable files vs the IP-safe case-study summary. */
  artifact: "raw" | "case-study";
  visibility: ExportVisibility;
}

/**
 * Resolve the export actions for an order. Empty when the order is not yet
 * complete or nothing is connected.
 */
export function buildExportPlan(input: ExportPlanInput): ExportAction[] {
  if (!input.orderCompleted) return [];
  const seen = new Set<ExportDestination>();
  const actions: ExportAction[] = [];
  for (const destination of input.connected) {
    if (seen.has(destination)) continue;
    seen.add(destination);
    const visibility = DESTINATION_VISIBILITY[destination];
    if (visibility === "private") {
      // Private archival of one's own work is allowed.
      actions.push({ destination, artifact: "raw", visibility });
    } else {
      // Public: raw only with the client's license; otherwise the case-study.
      actions.push({
        destination,
        artifact: input.clientShareable ? "raw" : "case-study",
        visibility,
      });
    }
  }
  return actions;
}

/** True when any raw client file would be exposed publicly (needs a license). */
export function planExposesRawPublicly(actions: ExportAction[]): boolean {
  return actions.some((a) => a.visibility === "public" && a.artifact === "raw");
}
