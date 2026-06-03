import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { startClientSignup } from "@/app/actions/auth";

export const metadata = { title: "Client sign up" };

export default function ClientSignupPage() {
  return (
    <Card className="p-7">
      <h1 className="text-xl font-semibold">Hire student talent</h1>
      <p className="mt-1 text-sm text-muted">Create a client account to post jobs and hire safely.</p>

      <form action={startClientSignup} className="mt-6 space-y-4">
        <Field label="Your name" name="name" placeholder="Priya Nair" />
        <Field label="Work email" name="email" type="email" placeholder="you@company.com" />
        <Field label="Company name" name="company" placeholder="Brewhaus Coffee Co." />
        <Field label="GSTIN (optional)" name="gstin" placeholder="29ABCDE1234F1Z5" />
        <Field label="Password" name="password" type="password" placeholder="••••••••" />
        <Button type="submit" variant="trust" className="w-full">
          Send verification code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Are you a student?{" "}
        <Link href="/auth/signup/student" className="font-medium text-brand-600 hover:underline">
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
    <div>
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
      />
    </div>
  );
}
