import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-sage)] text-[var(--color-brown-900)]">
        <Compass className="h-6 w-6" />
      </span>
      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--color-ink-muted)]">
        Not found
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-[var(--color-ink)]">
        We could not find that page.
      </h1>
      <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
        Maybe a link is stale, maybe the page moved. Head home and we will
        get you back on track.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-orange)] px-5 py-3 text-sm font-medium text-[var(--color-brown-900)] transition-colors hover:bg-[var(--color-orange-deep)]"
        >
          Back to home
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center justify-center rounded-full border border-[var(--color-ink)] px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
        >
          Browse talent
        </Link>
      </div>
    </main>
  );
}
