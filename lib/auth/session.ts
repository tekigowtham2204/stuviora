import "server-only";
import { cookies } from "next/headers";
import type { Role } from "@/lib/types";
import { services } from "@/lib/env";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  students,
  clients,
  admin,
  DEMO_STUDENT_ID,
  DEMO_CLIENT_ID,
} from "@/lib/demo/data";

/**
 * Session resolution (P1 demo cookie + P2 live Supabase Auth).
 *
 * The session shape is the same in both modes:
 *
 *   {
 *     id: uuid,        // matches users.id in the DB
 *     role: Role,      // student | client | admin | university
 *     name: string,    // display name (avoids a DB round-trip for chrome)
 *     initials: string // ditto for avatar fallback
 *   }
 *
 * Live mode (services.supabase = true):
 *   getSession() reads supabase.auth.getUser() first. If a verified
 *   user is returned, we hydrate the role + name from the users table
 *   row (cached behind a same-request memo). The `sv_session` cookie
 *   is then re-written from the live identity so middleware can keep
 *   its optimistic role check without hitting Supabase on every request.
 *
 * Demo mode:
 *   We trust the `sv_session` cookie verbatim. The auth Server Actions
 *   populate it from the chosen persona.
 *
 * `currentStudent/Client/Admin()` remain sync helpers used by the UI
 * for the demo personas (the "you" on every dashboard). When live keys
 * are present these will be reworked to read from the resolved
 * session + a per-request DB hit; for now they short-circuit to the
 * seeded demo personas.
 */

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  initials: string;
  /** For role=university: the college this partner is scoped to. */
  college?: string;
}

const COOKIE = "sv_session";

/** Read the current session. Live: verify against Supabase Auth. */
export async function getSession(): Promise<SessionUser | null> {
  if (services.supabase) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        // Hydrate the role + name from users + best-available profile.
        const { data: userRow } = await supabase
          .from("users")
          .select(
            `
            id,
            role,
            full_name,
            student_profiles ( username ),
            client_profiles ( company_name )
          `
          )
          .eq("id", data.user.id)
          .single<{
            id: string;
            role: Role;
            full_name: string | null;
            student_profiles: { username: string | null } | null;
            client_profiles: { company_name: string | null } | null;
          }>();
        if (userRow) {
          const name =
            userRow.client_profiles?.company_name ??
            userRow.full_name ??
            data.user.email ??
            "User";
          return {
            id: userRow.id,
            role: userRow.role,
            name,
            initials: initialsFrom(name),
          };
        }
      }
    }
  }

  // Demo path: cookie-only.
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

/** Persist a session cookie. Both demo and live call this to mirror the role. */
export async function setSession(user: SessionUser) {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

/** Clear the cookie and the live Supabase session. */
export async function clearSession() {
  if (services.supabase) {
    const supabase = await getServerSupabase();
    if (supabase) await supabase.auth.signOut();
  }
  const store = await cookies();
  store.delete(COOKIE);
}

/** The signed-in student persona ("you" on student pages). */
export function currentStudent() {
  return students.find((s) => s.id === DEMO_STUDENT_ID)!;
}

/** The signed-in client persona ("you" on client pages). */
export function currentClient() {
  return clients.find((c) => c.id === DEMO_CLIENT_ID)!;
}

/** The signed-in admin persona. */
export function currentAdmin() {
  return admin;
}

/** Compute display-initials from a name. Mirrors lib/data/mappers.initialsOf. */
function initialsFrom(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((p) => p[0]!.toUpperCase()).join("");
}
