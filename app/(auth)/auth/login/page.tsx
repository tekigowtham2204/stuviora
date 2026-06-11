import Link from "next/link";
import { GraduationCap, Building2, ShieldCheck, University } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { loginAs } from "@/app/actions/auth";
import { DEMO_MODE } from "@/lib/env";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Card className="p-8" surface="glow">
      <h1 className="font-display text-2xl font-medium tracking-tight text-[var(--color-ink)]">
        Welcome back.
      </h1>
      <p className="mt-1.5 text-sm text-[var(--color-ink-muted)]">
        Log in to your Stuviora account.
      </p>

      <form className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@college.ac.in" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="********"
          />
        </div>
      </form>

      {DEMO_MODE && (
        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-[var(--color-yellow-200)] bg-[var(--color-yellow-50)] p-3 text-xs text-[var(--color-yellow-900)]">
          <Badge tone="yellow">Demo</Badge>
          <span>Pick a role to explore the product instantly.</span>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-3">
        <form action={loginAs}>
          <input type="hidden" name="role" value="student" />
          <Button type="submit" variant="sage" className="w-full">
            <GraduationCap className="h-4 w-4" /> Continue as student
          </Button>
        </form>
        <form action={loginAs}>
          <input type="hidden" name="role" value="client" />
          <Button type="submit" variant="primary" className="w-full">
            <Building2 className="h-4 w-4" /> Continue as client
          </Button>
        </form>
      </div>

      {DEMO_MODE && (
        <div className="mt-3 grid grid-cols-1 gap-3">
          <form action={loginAs}>
            <input type="hidden" name="role" value="university" />
            <Button type="submit" variant="secondary" className="w-full">
              <University className="h-4 w-4" /> Continue as university
            </Button>
          </form>
          <form action={loginAs}>
            <input type="hidden" name="role" value="admin" />
            <Button type="submit" variant="ghost" className="w-full text-[var(--color-ink-muted)]">
              <ShieldCheck className="h-4 w-4" /> Continue as admin (founder)
            </Button>
          </form>
        </div>
      )}

      <p className="mt-7 text-center text-sm text-[var(--color-ink-muted)]">
        New to Stuviora?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-[var(--color-ink)] underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </Card>
  );
}
