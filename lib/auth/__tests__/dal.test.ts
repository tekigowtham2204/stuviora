import { describe, it, expect } from "vitest";
import { UnauthorizedError, ForbiddenError } from "@/lib/auth/dal";

// The bulk of dal.ts is wired to server-only modules (cookies, supabase
// SSR). Those need an integration test against a real request scope,
// which lives in the supabase-start integration suite (T3). Here we
// pin the public types + error classes so refactors do not break the
// callers.

describe("DAL errors", () => {
  it("UnauthorizedError carries the correct name", () => {
    const e = new UnauthorizedError();
    expect(e.name).toBe("UnauthorizedError");
    expect(e.message).toMatch(/authenticated/i);
  });

  it("ForbiddenError carries the correct name and accepts a custom message", () => {
    const e = new ForbiddenError("nope");
    expect(e.name).toBe("ForbiddenError");
    expect(e.message).toBe("nope");
  });

  it("DAL errors are subclasses of Error", () => {
    expect(new UnauthorizedError()).toBeInstanceOf(Error);
    expect(new ForbiddenError()).toBeInstanceOf(Error);
  });
});
