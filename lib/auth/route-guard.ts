import { NextResponse } from "next/server";
import { UnauthorizedError, ForbiddenError } from "@/lib/auth/dal";

/**
 * Map a DAL auth error to a clean HTTP response for API route handlers.
 *
 * Route handlers that call requireSession()/requireRole() should wrap the
 * body in try/catch and return authErrorResponse(e) when it is non-null,
 * otherwise rethrow. This turns an unauthenticated request into a 401/403
 * instead of an unhandled 500.
 */
export function authErrorResponse(e: unknown): NextResponse | null {
  if (e instanceof UnauthorizedError) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (e instanceof ForbiddenError) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}
