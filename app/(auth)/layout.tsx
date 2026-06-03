import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { BRAND } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <Container className="flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">{BRAND.name}</span>
          </Link>
        </Container>
      </header>
      <main className="flex flex-1 items-center justify-center bg-surface-muted px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
