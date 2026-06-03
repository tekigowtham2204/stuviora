import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listStudentProposals, getJob } from "@/lib/data/queries";
import { currentStudent } from "@/lib/auth/session";
import { formatINR } from "@/lib/utils";
import type { Job } from "@/lib/types";

export const metadata = { title: "My proposals" };

const STATUS_META = {
  submitted: { label: "Submitted", tone: "info" as const },
  shortlisted: { label: "Shortlisted", tone: "warning" as const },
  accepted: { label: "Accepted", tone: "success" as const },
  rejected: { label: "Not selected", tone: "neutral" as const },
  withdrawn: { label: "Withdrawn", tone: "neutral" as const },
};

export default async function StudentProposalsPage() {
  const me = currentStudent();
  const proposals = await listStudentProposals(me.id);

  // Resolve jobs in parallel
  const rows = await Promise.all(
    proposals.map(async (p) => ({ p, job: await getJob(p.jobId) as Job | null }))
  );

  return (
    <>
      <PageHeader
        title="My proposals"
        subtitle="Every bid you've submitted. Shortlisted ones move fastest."
      />

      <div className="space-y-3">
        {rows.length === 0 && (
          <Card className="text-sm text-muted">
            You haven&apos;t bid on any jobs yet. Head to{" "}
            <Link href="/student/jobs" className="font-medium text-brand-600 hover:underline">
              Browse jobs
            </Link>{" "}
            to find work that fits your skills.
          </Card>
        )}
        {rows.map(({ p, job }) => {
          const meta = STATUS_META[p.status];
          return (
            <Link key={p.id} href={job ? `/student/jobs/${job.id}` : "/student/proposals"}>
              <Card className="flex items-center justify-between gap-4 transition-colors hover:border-brand-300">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{job?.title ?? "Job"}</div>
                  <div className="mt-1 line-clamp-1 text-xs text-muted">{p.coverLetter}</div>
                  <div className="mt-2 text-xs text-muted">
                    Your bid: <span className="font-medium text-foreground">{formatINR(p.bidAmount)}</span> · {p.deliveryDays}d delivery
                  </div>
                </div>
                <Badge tone={meta.tone}>{meta.label}</Badge>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
