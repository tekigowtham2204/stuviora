import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic loading placeholder for data-heavy portal pages. Renders a
 * page-header skeleton followed by a grid of card skeletons so the
 * route segment reserves layout while its data resolves (audit #72).
 */
export function PageSkeleton({
  cards = 6,
  columns = 3,
}: {
  cards?: number;
  columns?: 1 | 2 | 3;
}) {
  const colClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading...</span>
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className={`mt-8 grid gap-4 ${colClass}`} aria-hidden>
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6"
          >
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-5/6" />
            <Skeleton className="mt-5 h-8 w-28 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
