import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BRAND } from "@/lib/constants";

const NAV = [
  { href: "/explore", label: "Browse talent" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--color-border)] backdrop-blur-xl"
      style={{ backgroundColor: "color-mix(in oklab, var(--color-background) 78%, transparent)" }}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600 ring-1 ring-brand-200/60 dark:bg-brand-900/30 dark:text-brand-300 dark:ring-brand-700/40">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-base font-semibold tracking-tight">{BRAND.name}</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button href="/auth/login" variant="ghost" size="sm">
            Log in
          </Button>
          <Button href="/auth/signup" variant="primary" size="sm">
            Get started
          </Button>
        </div>
      </Container>
    </header>
  );
}
