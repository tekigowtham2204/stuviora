import "server-only";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";

/**
 * Supabase Storage helpers (P2).
 *
 * Buckets are defined in `supabase/migrations/0005_storage_buckets.sql`.
 * Writes go through the service role; reads use signed URLs so RLS on
 * downstream tables is the source of truth.
 *
 * Each helper falls back to a `demo://` URI in DEMO_MODE so the UI can
 * render a stand-in without crashing. P7 (hardening) adds MIME sniff,
 * EXIF strip, and ZIP path-traversal guards on top of these primitives.
 */

export const BUCKETS = {
  portfolio: "portfolio",
  submissions: "submissions",
  disputeEvidence: "dispute_evidence",
  gstInvoices: "gst_invoices",
} as const;

export type BucketKey = keyof typeof BUCKETS;

export interface UploadInput {
  bucket: BucketKey;
  /** Stable path inside the bucket, e.g. `student-id/order-id/filename.pdf`. */
  path: string;
  /** File contents. Use Blob for File uploads from the browser, Buffer otherwise. */
  file: ArrayBuffer | Blob | Buffer;
  contentType: string;
  /** If true, overwrite. Default false (upload fails on conflict). */
  upsert?: boolean;
}

export interface UploadResult {
  bucket: BucketKey;
  path: string;
  /** Public-looking URI; signed when downloads happen via signedUrl(). */
  storageUri: string;
}

/** Upload a file. Service-role only. */
export async function uploadFile(input: UploadInput): Promise<UploadResult> {
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { error } = await supabase.storage
        .from(BUCKETS[input.bucket])
        .upload(input.path, input.file as Blob, {
          contentType: input.contentType,
          upsert: input.upsert ?? false,
        });
      if (error) throw new StorageUploadError(error.message);
      return {
        bucket: input.bucket,
        path: input.path,
        storageUri: `supabase://${BUCKETS[input.bucket]}/${input.path}`,
      };
    }
  }
  // Demo fallback: pretend we stored it. Not persisted; UI shows a
  // placeholder thumbnail on signed-URL miss.
  return {
    bucket: input.bucket,
    path: input.path,
    storageUri: `demo://${BUCKETS[input.bucket]}/${input.path}`,
  };
}

/**
 * Return a short-lived signed URL the browser can fetch directly.
 * Default expiry: 15 minutes. Live: Supabase signed URL. Demo: returns
 * a deterministic placeholder.
 */
export async function signedUrl(
  bucket: BucketKey,
  path: string,
  expiresSeconds = 900
): Promise<string> {
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data, error } = await supabase.storage
        .from(BUCKETS[bucket])
        .createSignedUrl(path, expiresSeconds);
      if (!error && data?.signedUrl) return data.signedUrl;
    }
  }
  return `/api/storage/placeholder?b=${bucket}&p=${encodeURIComponent(path)}`;
}

/** Convenience: portfolio uploads named by student + filename. */
export function portfolioPath(studentId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${studentId}/${Date.now()}-${safe}`;
}

/** Convenience: submission uploads named by order + filename. */
export function submissionPath(orderId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${orderId}/${Date.now()}-${safe}`;
}

/** Dispute evidence file path. */
export function evidencePath(disputeId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${disputeId}/${Date.now()}-${safe}`;
}

/** GST invoice file path. */
export function invoicePath(orderId: string): string {
  return `${orderId}/invoice.pdf`;
}

export class StorageUploadError extends Error {
  constructor(message = "Storage upload failed") {
    super(message);
    this.name = "StorageUploadError";
  }
}

/**
 * Remove a file. Idempotent: missing file is not an error.
 */
export async function deleteFile(bucket: BucketKey, path: string): Promise<void> {
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      // Live path: ignore "not found" errors so this stays idempotent.
      await supabase.storage.from(BUCKETS[bucket]).remove([path]);
    }
  }
}
