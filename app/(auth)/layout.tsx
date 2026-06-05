import Link from "next/link";
import { Container } from "@/components/ui/container";
import { BRAND } from "@/lib/constants";
import { Logomark } from "@/components/brand/logomark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
        <Container className="flex h-18 items-center py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Logomark className="h-8 w-8 text-[var(--color-ink)]" accent="var(--color-sage)" />
            <span className="font-display text-xl font-medium tracking-tight">
              {BRAND.name}
            </span>
          </Link>
        </Container>
      </header>
      <main className="bg-hero-canvas relative flex flex-1 items-center justify-center px-4 py-16">
        <div className="aurora opacity-40" />
        <div className="relative w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
