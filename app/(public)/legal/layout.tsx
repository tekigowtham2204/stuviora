import Link from "next/link";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/refund", label: "Refund policy" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="py-12 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Legal</h2>
          <nav className="mt-3 space-y-1">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors",
                  "text-muted hover:bg-surface-muted hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <article className="prose-stuviora max-w-3xl">{children}</article>
      </div>
    </Container>
  );
}
