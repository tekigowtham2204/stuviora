import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Fixed bottom navigation for portal mobile (P57 audit).
 *
 * Renders only on widths < 768. Five slots maximum, with a centre
 * pill CTA the persona's "next move" (post a job for clients,
 * matches for students, queue for admin).
 *
 * The active route is not highlighted server-side because Next 16
 * mounts the layout once per navigation; we use CSS-only `:hover`
 * + the parent nav's accent for a subtle "I am current" treatment.
 * A fully live highlight would need a Client Component subscribed to
 * pathname; T2 in build-checklist.md.
 */

export interface MobileNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** When true, renders larger and tinted as the persona's primary CTA. */
  primary?: boolean;
}

interface MobileNavProps {
  items: MobileNavItem[];
  accent: "sage" | "orange" | "yellow";
}

const accentClasses: Record<
  MobileNavProps["accent"],
  { primary: string; primaryRing: string }
> = {
  sage: {
    primary: "bg-[var(--color-sage)] text-[var(--color-brown-900)]",
    primaryRing: "ring-[var(--color-sage)]",
  },
  orange: {
    primary: "bg-[var(--color-orange)] text-[var(--color-brown-900)]",
    primaryRing: "ring-[var(--color-orange)]",
  },
  yellow: {
    primary: "bg-[var(--color-yellow)] text-[var(--color-brown-900)]",
    primaryRing: "ring-[var(--color-yellow)]",
  },
};

export function MobileNav({ items, accent }: MobileNavProps) {
  const a = accentClasses[accent];
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-[var(--color-surface)]/95 px-4 py-2 backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium tracking-tight transition-colors",
              item.primary
                ? cn(
                    "relative -mt-5 mx-1 flex-none rounded-full px-4 py-3 shadow-md ring-2 ring-offset-2 ring-offset-[var(--color-surface)]",
                    a.primary,
                    a.primaryRing
                  )
                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-ink)]"
            )}
          >
            <item.icon className={item.primary ? "h-5 w-5" : "h-4 w-4"} />
            {!item.primary && <span>{item.label}</span>}
            {item.primary && (
              <span className="sr-only">{item.label}</span>
            )}
          </Link>
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none mt-1 h-0 w-full"
        style={{ height: "env(safe-area-inset-bottom)" }}
      />
    </nav>
  );
}
