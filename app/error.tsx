"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Live: forward to Sentry once observability lands (P6).
    console.error("global-error", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-[var(--color-background, #f8f2e3)] text-[var(--color-ink, #473c33)]">
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fde0c2] text-[#a45a1f]">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-medium tracking-tight">
            Something snapped.
          </h1>
          <p className="mt-3 text-sm text-[var(--color-ink-muted, #6f6258)]">
            An unexpected error stopped this page from rendering. The team has
            been notified. Try again, or head home.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-[var(--color-ink-faint, #a89e92)] font-mono">
              ref {error.digest}
            </p>
          )}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fda769] px-5 py-3 text-sm font-medium text-[#2c241d] transition-colors hover:bg-[#e89253]"
            >
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-[#473c33] px-5 py-3 text-sm font-medium text-[#473c33] transition-colors hover:bg-[#473c33] hover:text-[#f8f2e3]"
            >
              Back to home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
