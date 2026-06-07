import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Server-friendly pagination strip. Renders prev / next links + a
 * "page X of Y" indicator. No client-side JS needed; URLs carry the
 * cursor in `?page=N`. Reusable across student/matches, jobs,
 * student/orders, client/matches once volume warrants.
 */
export interface PaginationProps {
  baseHref: string;
  /** Whole search-param object so we preserve filters. */
  preserve?: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
  /** Visible name in the "showing X to Y of Z" label. Default "results". */
  label?: string;
}

export function Pagination({
  baseHref,
  preserve = {},
  page,
  pageSize,
  total,
  label = "results",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);

  function href(targetPage: number): string {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(preserve)) {
      if (v) sp.set(k, v);
    }
    if (targetPage > 1) sp.set("page", String(targetPage));
    else sp.delete("page");
    const qs = sp.toString();
    return qs ? `${baseHref}?${qs}` : baseHref;
  }

  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-10 flex items-center justify-between gap-4"
      aria-label="Pagination"
    >
      <div className="text-xs text-[var(--color-ink-muted)]">
        Showing{" "}
        <span className="font-medium text-[var(--color-ink)]">
          {first} to {last}
        </span>{" "}
        of <span className="font-medium text-[var(--color-ink)]">{total}</span>{" "}
        {label}
      </div>
      <div className="flex items-center gap-2">
        <PageLink href={page > 1 ? href(page - 1) : null} aria="Previous page">
          <ChevronLeft className="h-4 w-4" /> Prev
        </PageLink>
        <span className="px-2 text-xs text-[var(--color-ink-muted)]">
          Page {page} of {totalPages}
        </span>
        <PageLink
          href={page < totalPages ? href(page + 1) : null}
          aria="Next page"
        >
          Next <ChevronRight className="h-4 w-4" />
        </PageLink>
      </div>
    </nav>
  );
}

function PageLink({
  href,
  aria,
  children,
}: {
  href: string | null;
  aria: string;
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium";
  if (!href) {
    return (
      <span
        aria-disabled
        className={cn(
          base,
          "cursor-not-allowed border-[var(--color-line)] text-[var(--color-ink-faint)]"
        )}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={aria}
      className={cn(
        base,
        "border-[var(--color-line-strong)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-ink)]"
      )}
    >
      {children}
    </Link>
  );
}
