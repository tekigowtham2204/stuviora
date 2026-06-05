import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { startClientSignup } from "@/app/actions/auth";

export const metadata = { title: "Client sign up" };

export default function ClientSignupPage() {
  return (
    <Card className="p-8" surface="glow">
      <h1 className="font-display text-2xl font-medium tracking-tight text-[var(--color-ink)]">
        Hire student talent.
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Create a client account to post jobs and hire safely.
      </p>

      <form action={startClientSignup} className="mt-6 space-y-4">
        <Field label="Your name" name="name" placeholder="Priya Nair" />
        <Field label="Work email" name="email" type="email" placeholder="you@company.com" />
        <Field label="Company name" name="company" placeholder="Brewhaus Coffee Co." />
        <Field label="GSTIN (optional)" name="gstin" placeholder="29ABCDE1234F1Z5" />
        <Field label="Password" name="password" type="password" placeholder="********" />
        <Button type="submit" variant="primary" className="w-full">
          Send verification code
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-[var(--color-ink-muted)]">
        Are you a student?{" "}
        <Link
          href="/auth/signup/student"
          className="font-medium text-[var(--color-ink)] underline-offset-4 hover:underline"
        >
          Sign up as a student
        </Link>
      </p>
    </Card>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} />
    </div>
  );
}
