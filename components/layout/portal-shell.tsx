import Link from "next/link";
import { Sparkles, LogOut, type LucideIcon } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface PortalShellProps {
  nav: NavItem[];
  accent: "brand" | "trust";
  user: { name: string; initials: string; sub: string };
  children: React.ReactNode;
}

export function PortalShell({ nav, accent, user, children }: PortalShellProps) {
  const accentChip =
    accent === "trust" ? "bg-trust-100 text-trust-700" : "bg-brand-100 text-brand-600";

  return (
    <div className="flex min-h-screen bg-surface-muted">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/" className="flex items-center gap-2">
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", accentChip)}>
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-semibold tracking-tight">{BRAND.name}</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold", accentChip)}>
              {user.initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user.name}</div>
              <div className="truncate text-xs text-muted">{user.sub}</div>
            </div>
            <ThemeToggle />
            <form action={logout}>
              <button type="submit" title="Log out" className="text-subtle hover:text-foreground transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (mobile nav) */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", accentChip)}>
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-semibold">{BRAND.name}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold", accentChip)}>
              {user.initials}
            </span>
          </div>
        </header>

        {/* Mobile nav scroller */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-3 py-2 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:bg-surface-muted"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
