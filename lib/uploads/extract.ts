import "server-only";

/**
 * File extractors (P4).
 *
 * Pulls raw text from common submission formats so the AI gate can
 * read the deliverable. Async wrappers over:
 *   - pdf-parse       PDF
 *   - mammoth         DOCX (raw text)
 *   - unzipit         ZIP (recurses one level deep)
 *   - raw text        any text/* MIME
 *   - OpenRouter Vision (P4 ext): images
 *
 * Each extractor caps output at MAX_EXTRACT_CHARS so a single 500-page
 * PDF cannot blow the prompt budget. Truncation is signalled in the
 * return value so the caller can tell the LLM "truncated".
 */

import * as unzipit from "unzipit";

export const MAX_EXTRACT_CHARS = 60_000;

export interface ExtractedFile {
  filename: string;
  mime: string;
  text: string;
  /** Number of characters dropped from end-of-file when truncating. */
  truncatedChars?: number;
}

function truncate(text: string): { text: string; truncatedChars?: number } {
  if (text.length <= MAX_EXTRACT_CHARS) return { text };
  return {
    text: text.slice(0, MAX_EXTRACT_CHARS),
    truncatedChars: text.length - MAX_EXTRACT_CHARS,
  };
}

/** Extract PDF text via pdf-parse. */
export async function extractPdf(buffer: Buffer, filename: string): Promise<ExtractedFile> {
  // Lazy import: pdf-parse pulls in a sample data file at top-level
  // require time which can trip up edge runtimes. Importing inside
  // the function keeps it server-action-only. The package has both
  // CJS and ESM forms across versions; we accept either shape.
  const pdfModule = (await import("pdf-parse")) as unknown;
  const pdfParse = (
    (pdfModule as { default?: unknown }).default ?? pdfModule
  ) as (b: Buffer) => Promise<{ text?: string }>;
  const result = await pdfParse(buffer);
  const t = truncate(result.text ?? "");
  return {
    filename,
    mime: "application/pdf",
    text: t.text,
    truncatedChars: t.truncatedChars,
  };
}

/** Extract DOCX text via mammoth. */
export async function extractDocx(
  buffer: Buffer,
  filename: string
): Promise<ExtractedFile> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  const t = truncate(result.value ?? "");
  return {
    filename,
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    text: t.text,
    truncatedChars: t.truncatedChars,
  };
}

/** Plain text passthrough. Any text/* MIME. */
export async function extractText(
  buffer: Buffer,
  filename: string,
  mime = "text/plain"
): Promise<ExtractedFile> {
  const t = truncate(buffer.toString("utf8"));
  return {
    filename,
    mime,
    text: t.text,
    truncatedChars: t.truncatedChars,
  };
}

/**
 * Extract everything in a ZIP: recurses one level. Larger nested ZIPs
 * are not expanded further (anti-zip-bomb). Each inner file ships its
 * own extracted text.
 */
export async function extractZip(
  buffer: Buffer,
  filename: string
): Promise<ExtractedFile[]> {
  const { entries } = await unzipit.unzip(new Uint8Array(buffer).buffer);
  const out: ExtractedFile[] = [];
  for (const [name, e] of Object.entries(entries)) {
    const entry = e as {
      isDirectory: boolean;
      size: number;
      blob: () => Promise<Blob>;
    };
    if (entry.isDirectory) continue;
    // ZIP-bomb guard: skip anything over 25 MB inflated.
    if (entry.size > 25 * 1024 * 1024) {
      out.push({
        filename: `${filename}/${name}`,
        mime: "application/octet-stream",
        text: `[skipped: ${name} exceeds 25 MB extracted]`,
      });
      continue;
    }
    const blob = await entry.blob();
    const inner = Buffer.from(await blob.arrayBuffer());
    const ext = name.toLowerCase().split(".").pop() ?? "";
    if (ext === "pdf") {
      out.push(await extractPdf(inner, `${filename}/${name}`));
    } else if (ext === "docx") {
      out.push(await extractDocx(inner, `${filename}/${name}`));
    } else if (TEXT_LIKE_EXTS.has(ext)) {
      out.push(await extractText(inner, `${filename}/${name}`, mimeFor(ext)));
    } else {
      // Unknown binary inside the ZIP: skip its content but record presence.
      out.push({
        filename: `${filename}/${name}`,
        mime: "application/octet-stream",
        text: "",
      });
    }
  }
  return out;
}

/** Convenience: pick an extractor by filename extension. */
export async function extractByName(
  buffer: Buffer,
  filename: string
): Promise<ExtractedFile[]> {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  if (ext === "pdf") return [await extractPdf(buffer, filename)];
  if (ext === "docx") return [await extractDocx(buffer, filename)];
  if (ext === "zip") return extractZip(buffer, filename);
  if (TEXT_LIKE_EXTS.has(ext))
    return [await extractText(buffer, filename, mimeFor(ext))];
  // Unknown binary: return a placeholder so the AI gate sees the
  // filename + size and can decide whether to ask the student to
  // re-upload in a supported format.
  return [
    {
      filename,
      mime: "application/octet-stream",
      text: `[binary file ${filename}, ${buffer.byteLength} bytes, not text-extractable]`,
    },
  ];
}

const TEXT_LIKE_EXTS = new Set([
  "txt",
  "md",
  "markdown",
  "rst",
  "json",
  "yaml",
  "yml",
  "csv",
  "tsv",
  "js",
  "jsx",
  "ts",
  "tsx",
  "py",
  "rb",
  "go",
  "rs",
  "java",
  "c",
  "cpp",
  "h",
  "html",
  "css",
  "scss",
  "sql",
  "sh",
]);

function mimeFor(ext: string): string {
  switch (ext) {
    case "json":
      return "application/json";
    case "csv":
    case "tsv":
      return "text/csv";
    case "html":
      return "text/html";
    case "md":
    case "markdown":
      return "text/markdown";
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "py":
    case "rb":
    case "go":
    case "rs":
    case "java":
    case "c":
    case "cpp":
    case "h":
      return "text/x-source";
    default:
      return "text/plain";
  }
}
