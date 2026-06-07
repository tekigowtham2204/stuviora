import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { DEMO_MODE, env, services } from "@/lib/env";

/**
 * Proxy (Next.js 16's renamed Middleware).
 *
 * Two jobs:
 *   1. Role-route protection: redirect unauthenticated requests to
 *      protected route prefixes to /auth/login.
 *   2. Supabase session refresh: when live keys are present, refresh
 *      the user's session cookie on the edge so SSR pages downstream
 *      get a current `auth.getUser()` without a round-trip.
 *
 * The actual authorization decisions live in the DAL (lib/auth/dal.ts)
 * because middleware runs on the edge with limited DB access. This
 * proxy only does the optimistic "you have a session cookie" gate.
 */

const ROLE_PREFIXES: Record<string, string> = {
  "/student": "student",
  "/client": "client",
  "/admin": "admin",
  "/university": "university",
};

function getProtectedRole(path: string): string | null {
  for (const [prefix, role] of Object.entries(ROLE_PREFIXES)) {
    if (path === prefix || path.startsWith(prefix + "/")) return role;
  }
  return null;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Step 1: live session refresh. This runs for every request whether
  // protected or not, so the Supabase cookie does not go stale.
  const response = NextResponse.next({ request: req });
  if (services.supabase) {
    const supabase = createServerClient(env.supabaseUrl!, env.supabaseAnonKey!, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    });
    // Touch getUser() so Supabase rotates the cookie if needed.
    await supabase.auth.getUser();
  }

  // Step 2: role-route protection.
  const protectedRole = getProtectedRole(pathname);
  if (!protectedRole) return response;
  if (DEMO_MODE) return response;

  const session = req.cookies.get("sv_session")?.value;
  if (!session) {
    const loginUrl = new URL("/auth/login", req.nextUrl);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)",
  ],
};
