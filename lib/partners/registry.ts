/**
 * Partner credential registry (P9.4).
 *
 * Resolves a partner's shared HMAC secret by API key id. Demo mode exposes
 * a single well-known partner so the B2B endpoints stay testable without a
 * database; live mode reads university_partners (migration 0007).
 *
 * Live note: the secret should be stored encrypted (Supabase Vault) and
 * decrypted here. The column is plain for now and flagged in the migration.
 */

import "server-only";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";

export interface Partner {
  keyId: string;
  secret: string;
  college: string | null;
  inviteCode?: string;
}

/** Well-known demo partner. Documented for testing; never used in live. */
export const DEMO_PARTNER: Partner = {
  keyId: "demo-partner",
  secret: "stuviora-demo-partner-secret",
  college: "IIT Bombay",
  inviteCode: "IITB2026",
};

export async function getPartnerByKey(keyId: string): Promise<Partner | null> {
  if (!keyId) return null;

  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      try {
        const { data } = await supabase
          .from("university_partners")
          .select("key_id, secret, college")
          .eq("key_id", keyId)
          .eq("active", true)
          .maybeSingle<{ key_id: string; secret: string; college: string | null }>();
        if (data) {
          return { keyId: data.key_id, secret: data.secret, college: data.college };
        }
        return null;
      } catch {
        return null;
      }
    }
  }

  // Demo fallback: only the well-known demo key resolves.
  return keyId === DEMO_PARTNER.keyId ? DEMO_PARTNER : null;
}
