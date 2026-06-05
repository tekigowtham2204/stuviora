import Link from "next/link";
import { GraduationCap, Building2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Sign up" };

const ROLES = [
  {
    href: "/auth/signup/student",
    icon: GraduationCap,
    title: "I'm a student",
    desc: "Earn from your skills. Get matched to jobs, deliver AI-reviewed work, and get paid safely.",
    accent: "sage" as const,
  },
  {
    href: "/auth/signup/client",
    icon: Building2,
    title: "I'm hiring",
    desc: "Post a job and hire verified student talent. Every delivery is quality-checked before you see it.",
    accent: "orange" as const,
  },
];

export default function SignupRolePage() {
  return (
    <div>
      <div className="text-center">
        <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--color-ink)]">
          Join Stuviora.
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          First, tell us who you are.
        </p>
      </div>
      <div className="mt-8 space-y-3">
        {ROLES.map((r) => (
          <Link key={r.href} href={r.href}>
            <Card className="group flex items-center gap-4 transition-all hover:border-[var(--color-ink)] hover:shadow-[var(--shadow-card-lg)]">
              <span
                className={
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl " +
                  (r.accent === "sage"
                    ? "bg-[var(--color-sage)] text-[var(--color-brown-900)]"
                    : "bg-[var(--color-orange)] text-[var(--color-brown-900)]")
                }
              >
                <r.icon className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h3 className="font-display text-lg font-medium text-[var(--color-ink)]">
                  {r.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{r.desc}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-ink)]" />
            </Card>
          </Link>
        ))}
      </div>
      <p className="mt-7 text-center text-sm text-[var(--color-ink-muted)]">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-[var(--color-ink)] underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
