"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("admin-error", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-yellow-100)] text-[var(--color-yellow-900)]">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-medium text-[var(--color-ink)]">
        Admin page failed.
      </h2>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Capture the ref below for the post-mortem.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-[var(--color-ink-faint)]">
          ref {error.digest}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-yellow)] px-5 py-2.5 text-sm font-medium text-[var(--color-brown-900)] hover:bg-[var(--color-yellow-deep)]"
        >
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center rounded-full border border-[var(--color-ink)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
