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
    tone: "brand",
  },
  {
    href: "/auth/signup/client",
    icon: Building2,
    title: "I'm hiring",
    desc: "Post a job and hire verified student talent. Every delivery is quality-checked before you see it.",
    tone: "trust",
  },
] as const;

export default function SignupRolePage() {
  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Join Stuviora</h1>
        <p className="mt-1 text-sm text-muted">First, tell us who you are.</p>
      </div>
      <div className="mt-6 space-y-3">
        {ROLES.map((r) => (
          <Link key={r.href} href={r.href}>
            <Card className="group flex items-center gap-4 transition-colors hover:border-brand-300">
              <span
                className={
                  r.tone === "brand"
                    ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600"
                    : "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-trust-100 text-trust-600"
                }
              >
                <r.icon className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold">{r.title}</h3>
                <p className="mt-0.5 text-sm text-muted">{r.desc}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-subtle transition-transform group-hover:translate-x-1" />
            </Card>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
