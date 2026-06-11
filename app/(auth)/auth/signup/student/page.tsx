import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldHint, Select } from "@/components/ui/input";
import { startStudentSignup } from "@/app/actions/auth";
import { getCollegeForInviteCode } from "@/lib/partners/registry";
import { AuthStepper } from "@/components/auth/auth-stepper";
import { PasswordField } from "@/components/auth/password-field";

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

export default async function StudentSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const referredCollege = ref ? await getCollegeForInviteCode(ref) : null;

  return (
    <Card className="p-8" surface="glow">
      <AuthStepper current={0} />
      <h1 className="font-display text-2xl font-medium tracking-tight text-[var(--color-ink)]">
        Create your student account.
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Use your{" "}
        <span className="font-medium text-[var(--color-ink)]">college email</span>. We
        verify it to build trust with clients.
      </p>

      {referredCollege && (
        <p className="mt-3 rounded-2xl border border-[var(--color-sage-200)] bg-[var(--color-sage-50)] p-3 text-xs text-[var(--color-sage-900)]">
          Joining via your college invite: your activity will count toward{" "}
          <span className="font-medium">{referredCollege}</span>.
        </p>
      )}

      <form action={startStudentSignup} className="mt-6 space-y-4">
        {ref && <input type="hidden" name="ref" value={ref} />}
        <Field label="Full name" name="name" placeholder="Aarav Mehta" />
        <Field
          label="College email"
          name="email"
          type="email"
          placeholder="you@iitb.ac.in"
          hint="Must be a recognised .ac.in or .edu.in domain."
        />
        <div className="space-y-1.5">
          <Label htmlFor="stream">Stream</Label>
          <Select id="stream" name="stream">
            {STREAMS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
        <PasswordField />
        <Button type="submit" variant="sage" className="w-full">
          Send verification code
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-[var(--color-ink-muted)]">
        Hiring instead?{" "}
        <Link
          href="/auth/signup/client"
          className="font-medium text-[var(--color-ink)] underline-offset-4 hover:underline"
        >
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
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} />
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}
