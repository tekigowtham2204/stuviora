"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function SharedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("shared-error", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-orange-100)] text-[var(--color-orange-900)]">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-medium text-[var(--color-ink)]">
        We could not load this page.
      </h2>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Something went wrong while loading this view. Try again, or head back
        to your home page.
      </p>
      {error.digest && (
        <p className="mt-1 font-mono text-xs text-[var(--color-ink-faint)]">
          ref {error.digest}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-sage)] px-5 py-2.5 text-sm font-medium text-[var(--color-brown-900)] hover:bg-[var(--color-sage-deep)]"
        >
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-[var(--color-ink)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
