import { Check } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { completeStudentOnboarding } from "@/app/actions/onboarding";
import { SERVICE_CATEGORIES } from "@/lib/constants";

export const metadata = { title: "Welcome to Stuviora" };

const STEPS = [
  { n: 1, title: "Profile" },
  { n: 2, title: "Skills" },
  { n: 3, title: "Skill test" },
  { n: 4, title: "First service" },
];

export default function StudentOnboardingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Badge tone="brand">Welcome</Badge>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Let&apos;s set you up to earn.
      </h1>
      <p className="mt-2 text-muted">
        Four short steps. About five minutes. You can edit anything later from settings.
      </p>

      <div className="mt-6 flex items-center gap-3">
        {STEPS.map((s) => (
          <div key={s.n} className="flex items-center gap-2 text-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {s.n}
            </span>
            <span className="text-muted">{s.title}</span>
          </div>
        ))}
      </div>

      <form action={completeStudentOnboarding} className="mt-8 space-y-6">
        <Card>
          <CardTitle>Profile basics</CardTitle>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Headline" name="headline" placeholder="Front-end dev who ships fast" />
            <Field label="City" name="city" placeholder="Mumbai" />
          </div>
          <textarea
            name="bio"
            rows={3}
            placeholder="Two lines about you and what you can do."
            className="mt-3 w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
          />
        </Card>

        <Card>
          <CardTitle>Skills you want to sell</CardTitle>
          <p className="mt-1 text-sm text-muted">Pick up to 6. You can add more later.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Copywriting",
              "Blogs",
              "SEO",
              "Editing",
              "Figma",
              "Branding",
              "Social design",
              "Illustration",
              "React",
              "Next.js",
              "Python",
              "Automation",
              "Excel",
              "Data viz",
              "Research",
              "Social media",
              "Reels",
            ].map((s) => (
              <label key={s} className="cursor-pointer">
                <input type="checkbox" name="skill" value={s} className="peer hidden" />
                <span className="inline-block rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors peer-checked:border-brand-300 peer-checked:bg-brand-100 peer-checked:text-brand-700 hover:border-border-strong">
                  {s}
                </span>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-trust-100 text-trust-700">
              <Check className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <CardTitle>Skill assessment (15 min)</CardTitle>
              <p className="mt-1 text-sm text-muted">
                A short AI-graded test in your top skill. Pass it and your profile shows a verified skill badge to clients. You can take it now, or skip and come back later.
              </p>
              <div className="mt-3 flex gap-2">
                <Button type="button" variant="outline">Start the test</Button>
                <span className="self-center text-xs text-subtle">or skip for now</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Create your first service</CardTitle>
          <p className="mt-1 text-sm text-muted">
            Optional, but it doubles the chance you get hired in your first week.
          </p>
          <div className="mt-3 space-y-3">
            <Field label="What will you offer?" name="serviceTitle" placeholder="e.g. Python automation scripts" />
            <div>
              <label htmlFor="serviceCategory" className="text-sm font-medium">Category</label>
              <select
                id="serviceCategory"
                name="serviceCategory"
                className="mt-1 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
              >
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" variant="ghost">
            Skip rest for now
          </Button>
          <Button type="submit" variant="primary">
            Finish setup
          </Button>
        </div>
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
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
      />
    </div>
  );
}
