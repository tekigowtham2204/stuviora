import "server-only";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";

/**
 * College email allowlist (P2).
 *
 * On signup we require the email to (a) end in `.ac.in` or `.edu.in`
 * AND (b) match the `college_domains` table seeded in
 * `supabase/migrations/0003_seed_taxonomy.sql`. Migration seed is the
 * initial 42 institutions; subsequent additions go via the admin
 * portal once we open more campuses.
 *
 * Disposable / throwaway providers are blocked even when the suffix
 * looks academic.
 */

/**
 * Built-in blocklist of disposable / scratch email providers we never
 * accept, even if a domain accidentally lands in `college_domains`.
 * Kept short and curated; expand as we see abuse.
 */
const DISPOSABLE_DOMAINS = new Set<string>([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "throwawaymail.com",
  "yopmail.com",
  "fakeinbox.com",
  "trashmail.com",
  "sharklasers.com",
  "mintemail.com",
]);

/** Acceptable academic TLD suffixes for Indian institutions. */
const ACADEMIC_SUFFIXES = [".ac.in", ".edu.in", ".edu"];

/** Extract the domain (lower-cased) from an email. Returns null on malformed input. */
export function emailDomain(email: string): string | null {
  const lower = email.trim().toLowerCase();
  const at = lower.lastIndexOf("@");
  if (at < 1 || at === lower.length - 1) return null;
  return lower.slice(at + 1);
}

/** Pure check: domain has an academic suffix AND is not on the blocklist. */
export function looksLikeCollegeEmail(email: string): boolean {
  const dom = emailDomain(email);
  if (!dom) return false;
  if (DISPOSABLE_DOMAINS.has(dom)) return false;
  return ACADEMIC_SUFFIXES.some((s) => dom.endsWith(s));
}

export interface CollegeMatch {
  domain: string;
  collegeId: string | null;
  collegeName: string | null;
}

/**
 * Look the domain up in `college_domains`. Live: query against the
 * service-role client (the table is service-role read in 0002 RLS).
 * Demo: returns a synthesized hit for any academic suffix so the
 * dev flow works without a DB.
 */
export async function findCollegeForEmail(
  email: string
): Promise<CollegeMatch | null> {
  const dom = emailDomain(email);
  if (!dom) return null;
  if (DISPOSABLE_DOMAINS.has(dom)) return null;

  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from("college_domains")
        .select(
          `
          domain,
          college_id,
          colleges ( name )
        `
        )
        .eq("domain", dom)
        .eq("is_verified", true)
        .maybeSingle<{
          domain: string;
          college_id: string | null;
          colleges: { name: string | null } | null;
        }>();
      if (!error && data) {
        return {
          domain: data.domain,
          collegeId: data.college_id,
          collegeName: data.colleges?.name ?? null,
        };
      }
      return null;
    }
  }

  // Demo fallback: accept anything with an academic suffix; we cannot
  // resolve a college without the DB, so leave the name null.
  if (ACADEMIC_SUFFIXES.some((s) => dom.endsWith(s))) {
    return { domain: dom, collegeId: null, collegeName: null };
  }
  return null;
}

/**
 * Strict verification helper for Server Actions.
 * Returns the match or throws a typed error so the UI can render
 * a specific "your college is not yet on Stuviora" page.
 */
export class UnverifiedCollegeError extends Error {
  domain: string;
  constructor(domain: string, message = "College not on allowlist") {
    super(message);
    this.name = "UnverifiedCollegeError";
    this.domain = domain;
  }
}

export async function requireVerifiedCollege(email: string): Promise<CollegeMatch> {
  const match = await findCollegeForEmail(email);
  if (!match) {
    const dom = emailDomain(email) ?? "?";
    throw new UnverifiedCollegeError(dom);
  }
  return match;
}
