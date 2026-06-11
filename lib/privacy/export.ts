/**
 * Data export assembler (P7 / DPDP "download my data", right of access).
 *
 * Pure: takes the records gathered for a user and shapes them into a
 * single portable JSON document. The Server Action / route handler does
 * the I/O (gathering from demo or Supabase) and hands the pieces here.
 */

import type { ConsentState } from "@/lib/privacy/consent";

export interface DataExportInput {
  userId: string;
  role: string;
  name: string;
  profile?: Record<string, unknown> | null;
  orders?: unknown[];
  proposals?: unknown[];
  reviews?: unknown[];
  portfolio?: unknown[];
  messages?: unknown[];
  consent?: ConsentState | null;
}

export interface DataExport {
  format: "stuviora.data-export.v1";
  exportedAt: string;
  subject: { userId: string; role: string; name: string };
  sections: Record<string, unknown[]>;
  profile: Record<string, unknown> | null;
  consent: ConsentState | null;
  counts: Record<string, number>;
}

export function assembleDataExport(
  input: DataExportInput,
  now: Date = new Date()
): DataExport {
  const sections: Record<string, unknown[]> = {
    orders: input.orders ?? [],
    proposals: input.proposals ?? [],
    reviews: input.reviews ?? [],
    portfolio: input.portfolio ?? [],
    messages: input.messages ?? [],
  };
  const counts: Record<string, number> = {};
  for (const [k, v] of Object.entries(sections)) counts[k] = v.length;

  return {
    format: "stuviora.data-export.v1",
    exportedAt: now.toISOString(),
    subject: { userId: input.userId, role: input.role, name: input.name },
    sections,
    profile: input.profile ?? null,
    consent: input.consent ?? null,
    counts,
  };
}

/** Pretty-printed JSON suitable for a file download. */
export function toExportJson(exp: DataExport): string {
  return JSON.stringify(exp, null, 2);
}

/** A safe, dated filename for the download. */
export function exportFilename(userId: string, now: Date = new Date()): string {
  const date = now.toISOString().slice(0, 10);
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  return `stuviora-data-${safeId}-${date}.json`;
}
