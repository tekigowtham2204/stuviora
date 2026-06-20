import { describe, it, expect } from "vitest";
import { publicUserId, ROLE_ID_PREFIX } from "@/lib/identity/public-id";
import type { Role } from "@/lib/types";

describe("publicUserId", () => {
  const uuid = "9f3c1a2b-4d5e-6f70-8192-a3b4c5d6e7f8";

  it("prefixes by role so each role is visibly distinct", () => {
    expect(publicUserId("student", uuid).startsWith("STU-")).toBe(true);
    expect(publicUserId("client", uuid).startsWith("CLI-")).toBe(true);
    expect(publicUserId("admin", uuid).startsWith("ADM-")).toBe(true);
    expect(publicUserId("university", uuid).startsWith("UNI-")).toBe(true);
  });

  it("matches the canonical format PREFIX-XXXXXXXX (8 uppercase hex)", () => {
    for (const role of Object.keys(ROLE_ID_PREFIX) as Role[]) {
      expect(publicUserId(role, uuid)).toMatch(/^(STU|CLI|ADM|UNI)-[0-9A-F]{8}$/);
    }
  });

  it("is deterministic: same role + id always yields the same code", () => {
    expect(publicUserId("student", uuid)).toBe(publicUserId("student", uuid));
  });

  it("same id under different roles differs only by prefix", () => {
    const s = publicUserId("student", uuid);
    const c = publicUserId("client", uuid);
    expect(s).not.toBe(c);
    expect(s.slice(4)).toBe(c.slice(4)); // suffix derives from the id only
  });

  it("different ids yield different suffixes", () => {
    const a = publicUserId("student", "aaaaaaaa-0000-0000-0000-000000000000");
    const b = publicUserId("student", "bbbbbbbb-0000-0000-0000-000000000000");
    expect(a).not.toBe(b);
  });

  it("works for demo-style ids, not just uuids", () => {
    expect(publicUserId("student", "stu-you")).toMatch(/^STU-[0-9A-F]{8}$/);
    expect(publicUserId("client", "cli-you")).toMatch(/^CLI-[0-9A-F]{8}$/);
  });
});
