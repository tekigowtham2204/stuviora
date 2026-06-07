import Link from "next/link";
import { LogOut, type LucideIcon } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logomark } from "@/components/brand/logomark";
import { MobileNav, type MobileNavItem } from "@/components/layout/mobile-nav";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Accent maps to the persona theme on the sidebar. */
type Accent = "sage" | "orange" | "yellow" | "brand" | "trust";

interface PortalShellProps {
  nav: NavItem[];
  /** Five-item fixed mobile bottom nav (P57 audit). Optional; portal
   *  shell falls back to the legacy horizontal scroller when absent. */
  mobileNav?: MobileNavItem[];
  accent: Accent;
  user: { name: string; initials: string; sub: string };
  /** Persona label shown in the sidebar header. */
  personaLabel?: string;
  children: React.ReactNode;
}

const accentStyles: Record<
  Accent,
  { chip: string; activeBar: string; pill: string; sidebarTint: string }
> = {
  sage: {
    chip: "bg-[var(--color-sage)] text-[var(--color-brown-900)]",
    activeBar: "bg-[var(--color-sage)]",
    pill: "bg-[var(--color-sage)]/15 text-[var(--color-sage)]",
    sidebarTint: "before:bg-[var(--color-sage)]",
  },
  orange: {
    chip: "bg-[var(--color-orange)] text-[var(--color-brown-900)]",
    activeBar: "bg-[var(--color-orange)]",
    pill: "bg-[var(--color-orange)]/15 text-[var(--color-orange)]",
    sidebarTint: "before:bg-[var(--color-orange)]",
  },
  yellow: {
    chip: "bg-[var(--color-yellow)] text-[var(--color-brown-900)]",
    activeBar: "bg-[var(--color-yellow)]",
    pill: "bg-[var(--color-yellow)]/15 text-[var(--color-yellow)]",
    sidebarTint: "before:bg-[var(--color-yellow)]",
  },
  brand: {
    chip: "bg-[var(--color-sage)] text-[var(--color-brown-900)]",
    activeBar: "bg-[var(--color-sage)]",
    pill: "bg-[var(--color-sage)]/15 text-[var(--color-sage)]",
    sidebarTint: "before:bg-[var(--color-sage)]",
  },
  trust: {
    chip: "bg-[var(--color-orange)] text-[var(--color-brown-900)]",
    activeBar: "bg-[var(--color-orange)]",
    pill: "bg-[var(--color-orange)]/15 text-[var(--color-orange)]",
    sidebarTint: "before:bg-[var(--color-orange)]",
  },
};

export function PortalShell({
  nav,
  mobileNav,
  accent,
  user,
  personaLabel,
  children,
}: PortalShellProps) {
  const s = accentStyles[accent];

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Sidebar (desktop) — warm brown chrome, cream text */}
      <aside
        className={cn(
          "relative hidden w-72 shrink-0 flex-col bg-[var(--color-brown)] text-[var(--color-cream)] lg:flex",
          "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r-full",
          s.sidebarTint
        )}
      >
        <div className="flex h-20 items-center px-7">
          <Link href="/" className="flex items-center gap-3">
            <Logomark className="h-8 w-8 text-[var(--color-cream)]" />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg font-medium tracking-tight">
                {BRAND.name}
              </span>
              {personaLabel && (
                <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-brown-300)]">
                  {personaLabel}
                </span>
              )}
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 pt-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[var(--color-cream)]/75",
                "transition-colors hover:bg-white/5 hover:text-[var(--color-cream)]"
              )}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-[var(--color-cream)]/80 transition-colors group-hover:bg-white/10">
                <item.icon className="h-4 w-4" />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/8 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
                s.chip
              )}
            >
              {user.initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-[var(--color-cream)]">
                {user.name}
              </div>
              <div className="truncate text-[11px] text-[var(--color-cream)]/60">
                {user.sub}
              </div>
            </div>
            <ThemeToggle />
            <form action={logout}>
              <button
                type="submit"
                title="Log out"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-cream)]/60 transition-colors hover:bg-white/10 hover:text-[var(--color-cream)]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="flex h-16 items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Logomark className="h-7 w-7 text-[var(--color-ink)]" />
            <span className="font-display text-lg font-medium tracking-tight text-[var(--color-ink)]">
              {BRAND.name}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                s.chip
              )}
            >
              {user.initials}
            </span>
          </div>
        </header>

        {/* Mobile top scroller (legacy nav). Hidden when mobileNav is
            provided, since the bottom bar covers it. */}
        {!mobileNav && (
          <nav className="flex gap-1 overflow-x-auto border-b border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-ink)]"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <main
          className={cn(
            "sv-page flex-1 px-6 py-8 lg:px-10 lg:py-12",
            mobileNav && "pb-28 lg:pb-12"
          )}
        >
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>

        {mobileNav && (
          <MobileNav
            items={mobileNav}
            accent={
              accent === "trust" || accent === "brand" ? "sage" : accent
            }
          />
        )}
      </div>
    </div>
  );
}
