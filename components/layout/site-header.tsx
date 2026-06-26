import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BRAND } from "@/lib/constants";
import { Logomark } from "@/components/brand/logomark";

const NAV = [
  { href: "/explore", label: "Browse talent" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/vision", label: "Vision" },
];

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--color-line)] backdrop-blur-xl"
      style={{ backgroundColor: "color-mix(in oklab, var(--color-background) 86%, transparent)" }}
    >
      <Container className="flex h-18 items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Logomark className="h-8 w-8 text-[var(--color-ink)]" accent="var(--color-sage)" />
          <span className="font-display text-xl font-medium tracking-tight text-[var(--color-ink)]">
            {BRAND.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
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
