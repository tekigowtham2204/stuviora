import type { Role } from "@/lib/types";

/**
 * Role -> public-ID prefix. The Supabase Auth UUID stays the real primary
 * key (RLS, foreign keys, escrow all depend on it); this is a separate
 * human-readable, role-tagged reference shown on profiles, invoices, and in
 * admin/support so each role is visibly distinct.
 */
export const ROLE_ID_PREFIX: Record<Role, string> = {
  student: "STU",
  client: "CLI",
  admin: "ADM",
  university: "UNI",
};

/**
 * FNV-1a 32-bit hash -> 8 uppercase hex chars. Deterministic and stable for
 * a given input, so the same user always maps to the same code in both demo
 * and live mode (no DB round-trip, no counter to keep in sync).
 */
function hash8(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

/**
 * Build a role-prefixed public/display id from the user's role and stable
 * raw id (the Supabase Auth UUID in live, the demo id in demo mode).
 *
 *   publicUserId("student", "9f3c1a2b-...") -> "STU-1A2B3C4D"
 *
 * The UUID remains the real key; this code is a cosmetic reference. It is
 * derived (not a sequence), so collisions are theoretically possible at very
 * large scale; if guaranteed-unique sequential codes (STU-00123) are needed
 * later, back this with a per-role DB sequence + a stored column.
 */
export function publicUserId(role: Role, rawId: string): string {
  const prefix = ROLE_ID_PREFIX[role] ?? "USR";
  return `${prefix}-${hash8(rawId)}`;
}
