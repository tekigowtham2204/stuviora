import { Check, Sparkles } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Label } from "@/components/ui/input";
import { completeStudentOnboarding } from "@/app/actions/onboarding";
import { ServiceCategoryPricing } from "@/components/feature/service-category-pricing";

export const metadata = { title: "Welcome to Stuviora" };

/**
 * 3-step starter profile. The earlier "Skill test" step lied (button
 * had no handler); removed until a real assessment ships (student-audit
 * #11). The two submit buttons are now distinctly typed (student-audit
 * #14) so Save-and-finish vs Save-for-now are separable.
 */
const STEPS = [
  { n: 1, title: "Profile" },
  { n: 2, title: "Skills" },
  { n: 3, title: "First service (optional)" },
];

export default function StudentOnboardingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Badge tone="sage">Welcome</Badge>
      <h1 className="mt-4 font-display text-3xl font-medium tracking-tight text-[var(--color-ink)]">
        Let&apos;s set you up to earn.
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Three short steps. About four minutes. You can edit anything later
        from settings.
      </p>

      <div className="mt-6 flex items-center gap-3">
        {STEPS.map((s) => (
          <div key={s.n} className="flex items-center gap-2 text-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-sage-100)] text-xs font-semibold text-[var(--color-sage-900)]">
              {s.n}
            </span>
            <span className="text-[var(--color-ink-muted)]">{s.title}</span>
          </div>
        ))}
      </div>

      <form action={completeStudentOnboarding} className="mt-8 space-y-6">
        <Card>
          <CardTitle>Profile basics</CardTitle>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                name="headline"
                placeholder="Front-end dev who ships fast"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="Mumbai" />
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={3}
              placeholder="Two lines about you and what you can do."
            />
          </div>
        </Card>

        <Card>
          <CardTitle>Skills you want to sell</CardTitle>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Pick up to 6. You can add more later.
          </p>
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
                <input
                  type="checkbox"
                  name="skill"
                  value={s}
                  className="peer hidden"
                />
                <span className="inline-block rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-ink-muted)] transition-colors peer-checked:border-[var(--color-sage-deep)] peer-checked:bg-[var(--color-sage-50)] peer-checked:text-[var(--color-sage-900)] hover:border-[var(--color-ink)]">
                  {s}
                </span>
              </label>
            ))}
          </div>
        </Card>

        <Card tint="warm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-sage)] text-[var(--color-brown-900)]">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <CardTitle>Take the skill test</CardTitle>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                A 5-question check per category. Pass it and clients see a
                verified skill badge on your profile from day one. Takes
                about three minutes.
              </p>
              <Button href="/student/skill-test" variant="sage" size="sm" className="mt-3">
                Start the test
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Create your first service (optional)</CardTitle>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Doubles the chance you get hired in your first week.
          </p>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="serviceTitle">What will you offer?</Label>
              <Input
                id="serviceTitle"
                name="serviceTitle"
                placeholder="e.g. Python automation scripts"
              />
            </div>
            <ServiceCategoryPricing />
          </div>
        </Card>

        {/* Two distinct named actions per student-audit #14. */}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="submit"
            name="action"
            value="save_only"
            variant="outline"
          >
            Save and add later
          </Button>
          <Button
            type="submit"
            name="action"
            value="finish"
            variant="primary"
          >
            <Check className="h-4 w-4" /> Finish setup
          </Button>
        </div>
      </form>
    </div>
  );
}
