import { Sparkles, ShieldCheck, Star } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { postJob } from "@/app/actions/jobs";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { listFeaturedPlans } from "@/lib/monetization/featured";

export const metadata = { title: "Post a job" };

export default function PostJobPage() {
  const featuredPlans = listFeaturedPlans("job");

  return (
    <>
      <PageHeader
        eyebrow="New brief"
        title="Post a job."
        subtitle="Clear briefs attract better proposals. Aim for 3 lines minimum. Top-matched students are notified within minutes of posting."
      />

      <form action={postJob} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardTitle>The brief</CardTitle>
            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Job title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Write 4 blog posts about SaaS onboarding"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select id="category" name="category">
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={7}
                  placeholder="What you need, who it is for, what success looks like, references."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="skills">Skills wanted (comma-separated)</Label>
                <Input id="skills" name="skills" placeholder="Copywriting, SEO, Blogs" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Budget and timeline</CardTitle>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="budgetMin">Min budget (INR)</Label>
                <Input id="budgetMin" name="budgetMin" type="number" placeholder="6000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="budgetMax">Max budget (INR)</Label>
                <Input id="budgetMax" name="budgetMax" type="number" placeholder="10000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deadlineDays">Deadline (days)</Label>
                <Input
                  id="deadlineDays"
                  name="deadlineDays"
                  type="number"
                  placeholder="10"
                />
              </div>
            </div>
          </Card>

          <Card tint="warm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[var(--color-yellow-deep)]" />
                <CardTitle>Feature this job (optional)</CardTitle>
              </div>
              <Badge tone="yellow">2x faster proposals</Badge>
            </div>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Featured jobs rank above standard listings in matches feeds and discovery
              search. Most featured jobs close in half the time.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {featuredPlans.map((p) => (
                <label
                  key={p.days}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-yellow-deep)] has-[:checked]:border-[var(--color-yellow-deep)] has-[:checked]:bg-[var(--color-yellow-50)]"
                >
                  <span>
                    <div className="text-sm font-medium text-[var(--color-ink)]">
                      {p.label}
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                      Top of feeds for {p.days} days
                    </div>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-display text-lg font-medium tabular-nums text-[var(--color-ink)]">
                      Rs.{p.amountRupees}
                    </span>
                    <input type="radio" name="featuredDays" value={p.days} />
                  </span>
                </label>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" variant="primary">
              Post job
            </Button>
            <Button type="button" variant="outline">
              Save as draft
            </Button>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card tint="warm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--color-orange)]" />
              <CardTitle>Posting tips</CardTitle>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--color-ink-muted)]">
              <li>
                Be specific about deliverables. "4 blog posts of 1200 to 1500 words" beats "some content".
              </li>
              <li>
                Share one reference. A link to something close to what you want pulls
                strong applicants.
              </li>
              <li>
                Pick a realistic deadline. Less than 48 hours filters out everyone except
                those already free.
              </li>
            </ul>
          </Card>
          <Card>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--color-sage-deep)]" />
              <CardTitle>How payment works</CardTitle>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              When you hire, you fund Razorpay escrow upfront. The student is paid only
              on your approval, with 72-hour auto-release if you do not respond.
            </p>
          </Card>
        </aside>
      </form>
    </>
  );
}
