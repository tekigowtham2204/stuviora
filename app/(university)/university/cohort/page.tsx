import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getCohortForCollege, listConsentedRoster } from "@/lib/data/queries";
import { scopedCollege } from "@/lib/auth/university";

export const metadata = { title: "Cohort" };

export default async function CohortPage() {
  const college = await scopedCollege();
  const [cohort, roster] = await Promise.all([
    getCohortForCollege(college),
    listConsentedRoster(college),
  ]);

  const total = cohort?.row.students ?? 0;
  const shared = roster.length;

  return (
    <>
      <PageHeader
        eyebrow={college}
        title="Your cohort."
        subtitle="Aggregate counts cover every student. Individual rows appear only for students who chose to share with their college."
      />

      <Card surface="flat" tint="warm" className="mb-6 flex items-center gap-2 text-sm">
        <ShieldCheck className="h-4 w-4 text-[var(--color-sage-deep)]" />
        <span className="text-[var(--color-ink-muted)]">
          {shared} of {total} students opted in to share their details. The rest
          are counted in the totals only, in line with our privacy policy.
        </span>
      </Card>

      <Card>
        <CardTitle>Shared roster</CardTitle>
        {roster.length === 0 ? (
          <EmptyState
            className="mt-4"
            title="No students have opted in yet"
            body="Students control this from their privacy settings. Encourage them to share so you can recognise their work."
          />
        ) : (
          <div className="mt-4 divide-y divide-[var(--color-line)]">
            {roster.map((r) => (
              <div key={r.username} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium text-[var(--color-ink)]">{r.name}</div>
                  <div className="text-xs text-[var(--color-ink-muted)]">@{r.username}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-ink-muted)]">{r.earningsBand}</span>
                  <Badge tone={r.activated ? "sage" : "neutral"}>
                    {r.activated ? "Active" : "Joined"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
