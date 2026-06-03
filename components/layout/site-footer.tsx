import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { BRAND } from "@/lib/constants";

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
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-subtle">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-semibold">{BRAND.name}</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted">{BRAND.tagline}</p>
          <p className="mt-2 text-xs text-subtle">{BRAND.handle} · India-first</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="border-t border-border py-6">
        <p className="text-xs text-subtle">
          © {new Date().getFullYear()} {BRAND.name}. {BRAND.meaning}.
        </p>
      </Container>
    </footer>
  );
}
