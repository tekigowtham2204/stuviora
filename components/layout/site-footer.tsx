import Link from "next/link";
import { Container } from "@/components/ui/container";
import { BRAND } from "@/lib/constants";
import { Logomark } from "@/components/brand/logomark";

const COLUMNS = [
  {
    title: "Students",
    links: [
      { href: "/auth/signup/student", label: "Become a freelancer" },
      { href: "/student/jobs", label: "Browse jobs" },
      { href: "/how-it-works", label: "How earning works" },
    ],
  },
  {
    title: "Clients",
    links: [
      { href: "/auth/signup/client", label: "Hire talent" },
      { href: "/client/post-job", label: "Post a job" },
      { href: "/explore", label: "Browse students" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/trust", label: "Trust, in numbers" },
      { href: "/help", label: "Help and FAQ" },
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--color-line)] bg-[var(--color-surface-warm)]">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Logomark className="h-8 w-8 text-[var(--color-ink)]" accent="var(--color-sage)" />
            <span className="font-display text-lg font-medium tracking-tight">{BRAND.name}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--color-ink-muted)]">
            {BRAND.tagline}
          </p>
          <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
            {BRAND.handle} · Built in India
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)]">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="border-t border-[var(--color-line)] py-6">
        <p className="text-xs text-[var(--color-ink-faint)]">
          © {new Date().getFullYear()} {BRAND.name}. {BRAND.meaning}.
        </p>
      </Container>
    </footer>
  );
}
