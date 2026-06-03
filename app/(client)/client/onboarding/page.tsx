import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { completeClientOnboarding } from "@/app/actions/onboarding";

export const metadata = { title: "Welcome to Stuviora" };

export default function ClientOnboardingPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Badge tone="trust">Welcome</Badge>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Tell us a bit about your company.
      </h1>
      <p className="mt-2 text-muted">
        Two minutes. Then post your first job and start receiving proposals from verified students.
      </p>

      <form action={completeClientOnboarding} className="mt-8 space-y-5">
        <Card>
          <CardTitle>Company</CardTitle>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Company name" name="company" placeholder="Brewhaus Coffee Co." />
            <Field label="City" name="city" placeholder="Bengaluru" />
            <Field label="GSTIN (optional)" name="gstin" placeholder="29ABCDE1234F1Z5" />
            <Field label="Website (optional)" name="website" placeholder="https://example.com" />
          </div>
        </Card>

        <Card>
          <CardTitle>What kind of work do you hire for?</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Content & copywriting",
              "Tech & development",
              "Design & creative",
              "Business & research",
              "Social media & marketing",
              "Data & AI",
            ].map((s) => (
              <label key={s} className="cursor-pointer">
                <input type="checkbox" name="interest" value={s} className="peer hidden" />
                <span className="inline-block rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors peer-checked:border-trust-300 peer-checked:bg-trust-100 peer-checked:text-trust-700 hover:border-border-strong">
                  {s}
                </span>
              </label>
            ))}
          </div>
        </Card>

        <Button type="submit" variant="trust">
          Continue to dashboard
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
      />
    </div>
  );
}
