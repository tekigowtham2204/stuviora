import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { startStudentSignup } from "@/app/actions/auth";

export const metadata = { title: "Student sign up" };

const STREAMS = [
  "Computer Science",
  "Commerce / BBA",
  "Literature / Humanities",
  "Design / Fine Arts",
  "Engineering",
  "Statistics / Data Science",
  "Other",
];

export default function StudentSignupPage() {
  return (
    <Card className="p-7">
      <h1 className="text-xl font-semibold">Create your student account</h1>
      <p className="mt-1 text-sm text-muted">
        Use your <span className="font-medium text-foreground">college email</span> — we verify it to
        build trust with clients.
      </p>

      <form action={startStudentSignup} className="mt-6 space-y-4">
        <Field label="Full name" name="name" placeholder="Aarav Mehta" />
        <Field
          label="College email"
          name="email"
          type="email"
          placeholder="you@iitb.ac.in"
          hint="Must be a recognised .ac.in / .edu.in domain."
        />
        <div>
          <label htmlFor="stream" className="text-sm font-medium">Stream</label>
          <select
            id="stream"
            name="stream"
            className="mt-1 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
          >
            {STREAMS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <Field label="Password" name="password" type="password" placeholder="••••••••" />
        <Button type="submit" variant="primary" className="w-full">
          Send verification code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Hiring instead?{" "}
        <Link href="/auth/signup/client" className="font-medium text-brand-600 hover:underline">
          Sign up as a client
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
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  hint?: string;
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
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </div>
  );
}
