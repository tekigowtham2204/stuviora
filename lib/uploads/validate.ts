/**
 * Upload validation (P7 hardening).
 *
 * Pure, I/O-free guards run before a file is stored or fed to the AI
 * gate. Covers the file-safety items called out in the master plan and
 * student-audit: extension/MIME allowlisting, per-file size caps, and a
 * ZIP path-traversal guard (a malicious archive entry like
 * "../../etc/passwd" must never be written or extracted).
 *
 * These are deliberately dependency-free so they run anywhere (Server
 * Action, Inngest worker) and are exhaustively unit-tested.
 */

/** Hard per-file ceiling. Mirrors the inflated-entry cap in extract.ts. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/** Extensions we accept for deliverables + portfolio + evidence. */
export const ALLOWED_EXTENSIONS = new Set([
  // documents
  "pdf", "doc", "docx", "txt", "md", "rtf", "csv", "json",
  // slides + sheets
  "ppt", "pptx", "xls", "xlsx",
  // images
  "png", "jpg", "jpeg", "gif", "webp", "svg",
  // code (usually inside a zip, but allow direct)
  "js", "ts", "tsx", "jsx", "py", "ipynb", "html", "css",
  // archives
  "zip",
]);

/** Expected MIME family per extension, for declared-type sanity checks. */
const EXT_MIME_HINT: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  zip: "application/zip",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  json: "application/json",
};

export function extensionOf(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? filename;
  const dot = base.lastIndexOf(".");
  return dot >= 0 ? base.slice(dot + 1).toLowerCase() : "";
}

export interface UploadCandidate {
  filename: string;
  mime: string;
  size: number;
}

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

/** Validate a single upload's name, declared type, and size. */
export function validateUpload(file: UploadCandidate): ValidationResult {
  if (!file.filename || !file.filename.trim()) {
    return { ok: false, reason: "Missing file name." };
  }
  if (file.size <= 0) {
    return { ok: false, reason: "File is empty." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: "File exceeds the 25 MB limit." };
  }
  const ext = extensionOf(file.filename);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { ok: false, reason: `File type ".${ext}" is not allowed.` };
  }
  // If we have a hint for this extension, a wildly mismatched declared
  // MIME (e.g. .pdf claiming image/png) is suspicious. We compare family
  // loosely because browsers send varied MIME strings.
  const hint = EXT_MIME_HINT[ext];
  if (hint && file.mime && !mimeFamilyMatches(file.mime, hint)) {
    return { ok: false, reason: "Declared file type does not match its extension." };
  }
  return { ok: true };
}

function mimeFamilyMatches(declared: string, hint: string): boolean {
  const d = declared.toLowerCase();
  if (d === hint) return true;
  // Treat any text/* as interchangeable, and octet-stream as "unknown, allow".
  if (d === "application/octet-stream") return true;
  const dFamily = d.split("/")[0];
  const hFamily = hint.split("/")[0];
  if (dFamily === "text" && hFamily === "text") return true;
  return dFamily === hFamily;
}

/**
 * True if a ZIP entry path is safe to extract/write. Rejects absolute
 * paths, drive letters, parent-directory traversal, and null bytes.
 */
export function isSafeZipEntryPath(entryPath: string): boolean {
  if (!entryPath) return false;
  if (entryPath.includes("\0")) return false;
  // Normalise separators.
  const p = entryPath.replace(/\\/g, "/");
  // Absolute path or Windows drive letter.
  if (p.startsWith("/")) return false;
  if (/^[a-zA-Z]:/.test(p)) return false;
  // Any path segment that is exactly ".." escapes the extraction root.
  const segments = p.split("/");
  if (segments.some((s) => s === "..")) return false;
  return true;
}

/** Return the subset of ZIP entry paths that are unsafe to extract. */
export function unsafeZipEntries(paths: string[]): string[] {
  return paths.filter((p) => !isSafeZipEntryPath(p));
}
