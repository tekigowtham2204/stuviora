import { describe, it, expect } from "vitest";
import {
  validateUpload,
  isSafeZipEntryPath,
  unsafeZipEntries,
  extensionOf,
  MAX_UPLOAD_BYTES,
} from "@/lib/uploads/validate";

describe("extensionOf", () => {
  it("reads the final extension, lowercased", () => {
    expect(extensionOf("Report.FINAL.PDF")).toBe("pdf");
    expect(extensionOf("path/to/file.docx")).toBe("docx");
    expect(extensionOf("noext")).toBe("");
  });
});

describe("validateUpload", () => {
  it("accepts a normal pdf", () => {
    expect(
      validateUpload({ filename: "brief.pdf", mime: "application/pdf", size: 1000 }).ok
    ).toBe(true);
  });

  it("rejects a disallowed extension", () => {
    const r = validateUpload({ filename: "malware.exe", mime: "application/octet-stream", size: 10 });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/not allowed/);
  });

  it("rejects an empty file and an oversize file", () => {
    expect(validateUpload({ filename: "a.txt", mime: "text/plain", size: 0 }).ok).toBe(false);
    expect(
      validateUpload({ filename: "a.txt", mime: "text/plain", size: MAX_UPLOAD_BYTES + 1 }).ok
    ).toBe(false);
  });

  it("flags a declared MIME that contradicts the extension", () => {
    const r = validateUpload({ filename: "doc.pdf", mime: "image/png", size: 100 });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/does not match/);
  });

  it("allows octet-stream as an unknown-but-permitted MIME", () => {
    expect(
      validateUpload({ filename: "data.json", mime: "application/octet-stream", size: 100 }).ok
    ).toBe(true);
  });
});

describe("isSafeZipEntryPath", () => {
  it("accepts ordinary nested paths", () => {
    expect(isSafeZipEntryPath("docs/report.pdf")).toBe(true);
    expect(isSafeZipEntryPath("a/b/c.txt")).toBe(true);
  });

  it("rejects traversal, absolute, drive-letter, and null-byte paths", () => {
    expect(isSafeZipEntryPath("../secret")).toBe(false);
    expect(isSafeZipEntryPath("a/../../b")).toBe(false);
    expect(isSafeZipEntryPath("/etc/passwd")).toBe(false);
    expect(isSafeZipEntryPath("C:\\Windows\\system32")).toBe(false);
    expect(isSafeZipEntryPath("a/\0/b")).toBe(false);
    expect(isSafeZipEntryPath("")).toBe(false);
  });

  it("unsafeZipEntries returns only the bad paths", () => {
    const bad = unsafeZipEntries(["ok/a.txt", "../escape", "/abs", "fine/b.pdf"]);
    expect(bad).toEqual(["../escape", "/abs"]);
  });
});
