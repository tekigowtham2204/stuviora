import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { postJob } from "@/app/actions/jobs";
import { SERVICE_CATEGORIES } from "@/lib/constants";

export const metadata = { title: "Post a job" };

export default function PostJobPage() {
  return (
    <>
      <PageHeader
        title="Post a job"
        subtitle="Clear briefs attract better proposals. Aim for 3 lines minimum."
      />

      <form action={postJob} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card>
            <CardTitle>The brief</CardTitle>
            <div className="mt-4 space-y-3">
              <Field label="Job title" name="title" placeholder="Write 4 blog posts about SaaS onboarding" />
              <div>
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="mt-1 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-trust-400"
                >
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  placeholder="What you need, who it's for, what success looks like, references."
                  className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-trust-400"
                />
              </div>
              <Field label="Skills wanted (comma-separated)" name="skills" placeholder="Copywriting, SEO, Blogs" />
            </div>
          </Card>

          <Card>
            <CardTitle>Budget & timeline</CardTitle>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Field label="Min budget (INR)" name="budgetMin" type="number" placeholder="6000" />
              <Field label="Max budget (INR)" name="budgetMax" type="number" placeholder="10000" />
              <Field label="Deadline (days)" name="deadlineDays" type="number" placeholder="10" />
            </div>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" variant="trust">Post job</Button>
            <Button type="button" variant="outline">Save as draft</Button>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <CardTitle>Posting tips</CardTitle>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Be specific about deliverables. &quot;4 blog posts of 1200 to 1500 words&quot; beats &quot;some content&quot;.</li>
              <li>Share one reference. A link to something close to what you want pulls strong applicants.</li>
              <li>Pick a realistic deadline. Less than 48 hours filters out everyone except those already free.</li>
            </ul>
          </Card>
          <Card>
            <CardTitle>How payment works</CardTitle>
            <p className="mt-2 text-sm text-muted">
              When you hire, you fund Razorpay escrow upfront. The student is paid only on your approval, with 72-hour auto-release if you don&apos;t respond.
            </p>
          </Card>
        </aside>
      </form>
    </>
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
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-trust-400"
      />
    </div>
  );
}
