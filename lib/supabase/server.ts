import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env, services } from "@/lib/env";

/**
 * Server-side Supabase client bound to the request's cookies.
 * Returns null when Supabase isn't configured (demo mode) so callers can
 * fall back to seeded data instead of crashing.
 */
export async function getServerSupabase() {
  if (!services.supabase) return null;
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore; the proxy refreshes sessions.
        }
      },
    },
  });
}

/**
 * Privileged service-role client — bypasses RLS. Use ONLY in trusted server
 * code (webhooks, background jobs, ledger writes). Never expose to the browser.
 */
export function getServiceSupabase() {
  if (!env.supabaseUrl || !env.supabaseServiceKey) return null;
  return createServerClient(env.supabaseUrl, env.supabaseServiceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
