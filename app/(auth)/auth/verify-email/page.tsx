import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { verifyOtp } from "@/app/actions/auth";
import { DEMO_MODE } from "@/lib/env";

export const metadata = { title: "Verify email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; email?: string }>;
}) {
  const { role = "student", email } = await searchParams;

  return (
    <Card className="p-8 text-center" surface="glow">
      <Badge tone="sage">Step 2 of 2</Badge>
      <h1 className="mt-4 font-display text-2xl font-medium tracking-tight text-[var(--color-ink)]">
        Verify your email.
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-[var(--color-ink)]">
          {email || "your inbox"}
        </span>
        .
      </p>

      <form action={verifyOtp} className="mt-6 space-y-4">
        <input type="hidden" name="role" value={role} />
        <input
          name="otp"
          inputMode="numeric"
          maxLength={6}
          placeholder="......"
          className="w-full rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-4 py-4 text-center text-3xl tracking-[0.5em] tabular-nums text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-ink)]/15"
        />
        <Button type="submit" variant="primary" className="w-full">
          Verify and continue
        </Button>
      </form>

      {DEMO_MODE && (
        <p className="mt-5 rounded-2xl border border-[var(--color-yellow-200)] bg-[var(--color-yellow-50)] p-3 text-xs text-[var(--color-yellow-900)]">
          Demo mode: enter any code (or none) and continue.
        </p>
      )}

      <p className="mt-6 text-sm text-[var(--color-ink-muted)]">
        Did not get it?{" "}
        <button className="font-medium text-[var(--color-ink)] underline-offset-4 hover:underline">
          Resend code
        </button>
      </p>
    </Card>
  );
}
