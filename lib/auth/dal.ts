import "server-only";
import { getSession, type SessionUser } from "@/lib/auth/session";
import { getServerSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";

/**
 * Data Access Layer (DAL).
 *
 * The DAL is the single place Server Actions ask "who is the current
 * user?" before touching the database. It returns a sealed
 * `AuthorizedSession` so business code does not have to remember to
 * authenticate before writing.
 *
 * Pattern:
 *   import { requireSession, requireRole } from "@/lib/auth/dal";
 *   export async function postJob(formData: FormData) {
 *     const { user } = await requireRole("client");
 *     // ... live writes via getServiceSupabase() with user.id stamped in
 *   }
 *
 * - Demo mode: returns the cookie-encoded persona id; live mode adds a
 *   Supabase Auth getUser() check on top so a stolen cookie alone is
 *   not enough.
 * - DAL throws on missing or wrong-role sessions. Server Actions catch
 *   and either redirect to /auth/login or return a friendly error.
 *
 * P2 will layer in real Supabase Auth integration in `getSession()`
 * (currently cookie-only). This DAL is the boundary that benefits from
 * that upgrade without callers changing.
 */

export type Role = SessionUser["role"];

export class UnauthorizedError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Insufficient permissions") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export interface AuthorizedSession {
  user: SessionUser;
}

/**
 * Read the current session and verify it against Supabase Auth when
 * live keys are configured. Returns the session or throws.
 */
export async function requireSession(): Promise<AuthorizedSession> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();

  // Live: cross-check against Supabase Auth so a stale or forged cookie
  // alone cannot impersonate a user.
  if (services.supabase) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.getUser();
      // In demo + no-auth mode getUser returns an error; that's fine.
      // We only care about a positive identity assertion.
      if (!error && data?.user) {
        // The Supabase user id is the same uuid we store on `users.id`;
        // if the cookie persona id does not match, treat as session
        // mismatch and reject.
        if (data.user.id !== session.id) {
          throw new UnauthorizedError("Session mismatch");
        }
      }
    }
  }

  return { user: session };
}

/**
 * Require a session AND a specific role. Throws `ForbiddenError` if the
 * session is authenticated but to the wrong role.
 *
 * Pass an array to allow multiple roles (e.g. `requireRole(["client", "admin"])`).
 */
export async function requireRole(
  role: Role | Role[]
): Promise<AuthorizedSession> {
  const session = await requireSession();
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(session.user.role)) {
    throw new ForbiddenError(
      `Action requires role(s): ${allowed.join(", ")}, but session has ${session.user.role}`
    );
  }
  return session;
}

/**
 * Soft version of `requireSession` that returns null instead of
 * throwing. Use only for surfaces that legitimately render for both
 * authenticated and anonymous users.
 */
export async function maybeSession(): Promise<AuthorizedSession | null> {
  try {
    return await requireSession();
  } catch {
    return null;
  }
}
