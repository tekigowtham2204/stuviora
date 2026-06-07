import { describe, it, expect } from "vitest";
import {
  BUCKETS,
  portfolioPath,
  submissionPath,
  evidencePath,
  invoicePath,
  StorageUploadError,
} from "@/lib/storage/files";

describe("BUCKETS", () => {
  it("exposes the four canonical buckets", () => {
    expect(BUCKETS.portfolio).toBe("portfolio");
    expect(BUCKETS.submissions).toBe("submissions");
    expect(BUCKETS.disputeEvidence).toBe("dispute_evidence");
    expect(BUCKETS.gstInvoices).toBe("gst_invoices");
  });
});

describe("portfolioPath", () => {
  it("scopes by student and timestamps the filename", () => {
    const p = portfolioPath("stu-1", "case study.pdf");
    expect(p).toMatch(/^stu-1\/\d+-case_study\.pdf$/);
  });

  it("sanitizes unsafe path characters in filename", () => {
    const p = portfolioPath("stu-1", "../etc/passwd");
    // Slashes are stripped so no directory traversal can land outside
    // the student's own prefix. Dots and underscores are allowed but
    // cannot cause traversal without a slash.
    expect(p.split("/")).toHaveLength(2);
    expect(p.startsWith("stu-1/")).toBe(true);
    expect(p).not.toContain("/etc/");
    expect(p).not.toContain("/passwd");
  });
});

describe("submissionPath", () => {
  it("scopes by order id", () => {
    const p = submissionPath("SV-1042", "delivery.zip");
    expect(p).toMatch(/^SV-1042\/\d+-delivery\.zip$/);
  });
});

describe("evidencePath", () => {
  it("scopes by dispute id", () => {
    const p = evidencePath("DSP-2007", "moodboard.png");
    expect(p).toMatch(/^DSP-2007\/\d+-moodboard\.png$/);
  });
});

describe("invoicePath", () => {
  it("returns a stable per-order path", () => {
    expect(invoicePath("SV-1042")).toBe("SV-1042/invoice.pdf");
  });
});

describe("StorageUploadError", () => {
  it("carries the correct error name", () => {
    expect(new StorageUploadError().name).toBe("StorageUploadError");
  });
});
