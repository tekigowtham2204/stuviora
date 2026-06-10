import Link from "next/link";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ProposalStatusPill } from "@/components/ui/status-pill";
import { Money } from "@/components/ui/money";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { listStudentProposals, getJob } from "@/lib/data/queries";
import { currentStudent } from "@/lib/auth/session";
import { proposalTemplates } from "@/lib/demo/state";
import type { Job } from "@/lib/types";

export const metadata = { title: "My proposals" };

export default async function StudentProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ templates?: string }>;
}) {
  const { templates } = await searchParams;
  const me = currentStudent();

  if (templates) {
    const mine = proposalTemplates.filter((t) => t.studentId === me.id);
    return (
      <>
        <PageHeader
          eyebrow="Pipeline"
          title="Proposal templates."
          subtitle="Pitches you saved for reuse. Tick the save box when submitting a proposal to add one."
        />
        {mine.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No templates yet"
            body="When you submit a proposal, tick 'Save this pitch as a template' and it appears here."
            action={
              <Button href="/student/proposals" variant="sage">
                Back to proposals
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {mine.map((t) => (
              <Card key={t.id}>
                <div className="text-sm font-medium text-[var(--color-ink)]">{t.label}</div>
                <p className="mt-2 whitespace-pre-line text-sm text-[var(--color-ink-muted)]">{t.body}</p>
              </Card>
            ))}
            <Button href="/student/proposals" variant="secondary" size="sm">
              Back to proposals
            </Button>
          </div>
        )}
      </>
    );
  }

  const proposals = await listStudentProposals(me.id);

  const rows = await Promise.all(
    proposals.map(async (p) => ({ p, job: (await getJob(p.jobId)) as Job | null }))
  );

  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title="My proposals."
        subtitle="Every bid you have submitted. Shortlisted ones move fastest."
        action={
          <Button href="/student/proposals?templates=1" variant="secondary" size="sm">
            Templates
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No proposals yet"
          body="Browse open jobs and apply to a few that fit your skills."
          action={
            <Button href="/student/jobs" variant="sage">
              Browse jobs
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {rows.map(({ p, job }) => (
            <Link
              key={p.id}
              href={job ? `/student/jobs/${job.id}` : "/student/proposals"}
            >
              <Card className="flex items-center justify-between gap-4 transition-colors hover:border-[var(--color-sage)]">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-[var(--color-ink)]">
                    {job?.title ?? "Job"}
                  </div>
                  <div className="mt-1.5 line-clamp-1 text-sm text-[var(--color-ink-muted)]">
                    {p.coverLetter}
                  </div>
                  <div className="mt-2 text-xs text-[var(--color-ink-muted)]">
                    Your bid: <Money value={p.bidAmount} /> · {p.deliveryDays}d delivery
                  </div>
                </div>
                <ProposalStatusPill status={p.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
