import { FileBarChart, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { scopedCollege } from "@/lib/auth/university";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const college = await scopedCollege();

  return (
    <>
      <PageHeader
        eyebrow={college}
        title="Reports."
        subtitle="Download cohort activity for your management, NAAC, and NEP records."
      />

      <Card>
        <div className="flex items-center gap-2">
          <FileBarChart className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <CardTitle>Cohort CSV</CardTitle>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          A spreadsheet of your cohort: students joined, activation rate, total
          earnings, and category mix. Aggregate figures only, no individual
          personal data.
        </p>
        <Button href="/api/university/report" variant="sage" className="mt-5">
          <Download className="h-4 w-4" /> Download cohort report
        </Button>
      </Card>
    </>
  );
}
