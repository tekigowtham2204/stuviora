import { Users, TrendingUp, Wallet, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Money } from "@/components/ui/money";
import { EmptyState } from "@/components/ui/empty-state";
import { getCohortForCollege } from "@/lib/data/queries";
import { scopedCollege } from "@/lib/auth/university";

export const metadata = { title: "University dashboard" };

export default async function UniversityDashboard() {
  const college = await scopedCollege();
  const cohort = await getCohortForCollege(college);

  if (!cohort) {
    return (
      <>
        <PageHeader eyebrow={college} title="Cohort dashboard." />
        <EmptyState
          title="No students yet"
          body="Once your students join with their college email or your invite link, their activity shows up here."
        />
      </>
    );
  }

  const { row, categoryMix } = cohort;
  const activationPct = Math.round(row.activationRate * 100);

  return (
    <>
      <PageHeader
        eyebrow={college}
        title="Cohort dashboard."
        subtitle="Aggregate activity for your students on Stuviora. Figures are cohort totals; individual student data is opt-in."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<Users className="h-3.5 w-3.5" />} label="Students" value={String(row.students)} sub="joined" />
        <Stat icon={<TrendingUp className="h-3.5 w-3.5" />} label="Activated" value={String(row.activated)} sub={`${activationPct}% activation`} accent="sage" />
        <Stat icon={<Wallet className="h-3.5 w-3.5" />} label="Total earned" value={`Rs.${row.gmv.toLocaleString("en-IN")}`} sub="by this cohort" accent="orange" />
        <Stat icon={<Sparkles className="h-3.5 w-3.5" />} label="Per student" value={`Rs.${row.gmvPerStudent.toLocaleString("en-IN")}`} sub="average" />
      </div>

      <Card className="mt-6">
        <CardTitle>What your students work on</CardTitle>
        <ul className="mt-4 space-y-2">
          {categoryMix.map((c) => (
            <li key={c.category} className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-ink)]">{c.category.replace(/-/g, " ")}</span>
              <span className="tabular-nums text-[var(--color-ink-muted)]">{c.count}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-6" tint="warm">
        <CardTitle>Experiential learning, documented</CardTitle>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Your students earned{" "}
          <span className="font-medium text-[var(--color-ink)]">
            <Money value={row.gmv} />
          </span>{" "}
          doing real, AI-reviewed freelance work. Download a cohort report from
          the Reports tab for your NAAC and NEP records.
        </p>
      </Card>
    </>
  );
}
