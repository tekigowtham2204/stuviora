import { describe, it, expect } from "vitest";
import { extractText, extractByName, MAX_EXTRACT_CHARS } from "@/lib/uploads/extract";

describe("extractText", () => {
  it("returns the buffer as utf-8 text", async () => {
    const buf = Buffer.from("hello world", "utf8");
    const r = await extractText(buf, "note.txt");
    expect(r.filename).toBe("note.txt");
    expect(r.text).toBe("hello world");
    expect(r.truncatedChars).toBeUndefined();
  });

  it("truncates at MAX_EXTRACT_CHARS and reports the drop", async () => {
    const big = "x".repeat(MAX_EXTRACT_CHARS + 50);
    const r = await extractText(Buffer.from(big, "utf8"), "big.txt");
    expect(r.text.length).toBe(MAX_EXTRACT_CHARS);
    expect(r.truncatedChars).toBe(50);
  });
});

describe("extractByName", () => {
  it("routes text-like extensions through extractText", async () => {
    const out = await extractByName(Buffer.from("hi", "utf8"), "notes.md");
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe("hi");
  });

  it("returns a placeholder for unknown binary types", async () => {
    const buf = Buffer.alloc(128, 1);
    const out = await extractByName(buf, "image.gif");
    expect(out).toHaveLength(1);
    expect(out[0].text).toContain("[binary file");
    expect(out[0].text).toContain("image.gif");
  });
});
