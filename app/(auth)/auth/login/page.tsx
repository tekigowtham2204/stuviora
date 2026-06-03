import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loginAs } from "@/app/actions/auth";
import { DEMO_MODE } from "@/lib/env";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Card className="p-7">
      <h1 className="text-xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Log in to your Stuviora account.</p>

      <form className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@college.ac.in"
            className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
      </form>

      {DEMO_MODE && (
        <div className="mt-5 rounded-lg bg-info-bg p-3 text-xs text-info">
          Demo mode — pick a role to explore the product instantly.
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <form action={loginAs}>
          <input type="hidden" name="role" value="student" />
          <Button type="submit" variant="primary" className="w-full">Continue as student</Button>
        </form>
        <form action={loginAs}>
          <input type="hidden" name="role" value="client" />
          <Button type="submit" variant="trust" className="w-full">Continue as client</Button>
        </form>
      </div>

      {DEMO_MODE && (
        <form action={loginAs} className="mt-3">
          <input type="hidden" name="role" value="admin" />
          <Button type="submit" variant="ghost" className="w-full text-muted">
            Continue as admin (founder)
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        New to Stuviora?{" "}
        <Link href="/auth/signup" className="font-medium text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </Card>
  );
}
