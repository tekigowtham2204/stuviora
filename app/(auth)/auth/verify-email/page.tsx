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
    <Card className="p-7 text-center">
      <Badge tone="brand">Step 2 of 2</Badge>
      <h1 className="mt-3 text-xl font-semibold">Verify your email</h1>
      <p className="mt-1 text-sm text-muted">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-foreground">{email || "your inbox"}</span>.
      </p>

      <form action={verifyOtp} className="mt-6 space-y-4">
        <input type="hidden" name="role" value={role} />
        <input
          name="otp"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••••"
          className="w-full rounded-lg border border-border-strong px-3 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-brand-400"
        />
        <Button type="submit" variant="primary" className="w-full">
          Verify &amp; continue
        </Button>
      </form>

      {DEMO_MODE && (
        <p className="mt-4 rounded-lg bg-info-bg p-3 text-xs text-info">
          Demo mode — enter any code (or none) and continue.
        </p>
      )}

      <p className="mt-5 text-sm text-muted">
        Didn&apos;t get it? <button className="font-medium text-brand-600 hover:underline">Resend code</button>
      </p>
    </Card>
  );
}
