import { NextResponse, type NextRequest } from "next/server";
import { DEMO_MODE } from "@/lib/env";

/**
 * Proxy (Next.js 16's renamed Middleware). Optimistic auth + role-routing only —
 * the secure checks live in the Data Access Layer (lib/auth/dal.ts).
 *
 * In DEMO_MODE there's no real session yet, so we allow all routes through to
 * keep the full product browsable; live mode enforces the session cookie.
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
  const protectedRole = getProtectedRole(pathname);

  if (!protectedRole) return NextResponse.next();
  if (DEMO_MODE) return NextResponse.next();

  // Live mode: optimistic cookie check (role-specific session set at login).
  const session = req.cookies.get("sv_session")?.value;
  if (!session) {
    const loginUrl = new URL("/auth/login", req.nextUrl);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)"],
};
