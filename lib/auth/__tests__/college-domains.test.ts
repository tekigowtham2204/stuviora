import { describe, it, expect } from "vitest";
import {
  emailDomain,
  looksLikeCollegeEmail,
  UnverifiedCollegeError,
} from "@/lib/auth/college-domains";

describe("emailDomain", () => {
  it("returns the lower-cased domain", () => {
    expect(emailDomain("Aarav@IITB.AC.IN")).toBe("iitb.ac.in");
  });

  it("trims whitespace", () => {
    expect(emailDomain("  diya@lsr.du.ac.in  ")).toBe("lsr.du.ac.in");
  });

  it("returns null on malformed input", () => {
    expect(emailDomain("no-at-symbol")).toBeNull();
    expect(emailDomain("@no-local-part")).toBeNull();
    expect(emailDomain("no-domain@")).toBeNull();
    expect(emailDomain("")).toBeNull();
  });
});

describe("looksLikeCollegeEmail", () => {
  it.each([
    ["aarav@iitb.ac.in", true],
    ["diya@lsr.du.ac.in", true],
    ["kabir@nid.edu", true],
    ["ananya@christuniversity.in", false], // .in alone is not academic
    ["someone@gmail.com", false],
    ["scammer@mailinator.com", false], // disposable
    ["fake@guerrillamail.com", false],
    ["fake@yopmail.com", false],
  ])("classifies %s as %s", (email, expected) => {
    expect(looksLikeCollegeEmail(email)).toBe(expected);
  });
});

describe("UnverifiedCollegeError", () => {
  it("carries the offending domain", () => {
    const e = new UnverifiedCollegeError("randomcollege.in");
    expect(e.name).toBe("UnverifiedCollegeError");
    expect(e.domain).toBe("randomcollege.in");
  });
});
