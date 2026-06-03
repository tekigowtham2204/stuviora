import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, BadgeCheck, Sparkles, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getJob, listJobProposals, getStudentById } from "@/lib/data/queries";
import { hireProposal } from "@/app/actions/jobs";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "Proposals" };

export default async function ClientProposalsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const proposals = await listJobProposals(job.id);
  const rows = await Promise.all(
    proposals.map(async (p) => ({ p, student: await getStudentById(p.studentId) }))
  );

  // Rank by trust score then bid value
  rows.sort((a, b) => {
    const aT = a.student?.trustScore ?? 0;
    const bT = b.student?.trustScore ?? 0;
    return bT - aT;
  });

  return (
    <>
      <PageHeader
        title={job.title}
        subtitle={`${proposals.length} proposals · ${formatINR(job.budgetMin)} to ${formatINR(job.budgetMax)} budget`}
      />

      {rows.length > 0 && (
        <Card className="mb-5 border-info-bg bg-info-bg/30">
          <div className="flex items-center gap-2 text-sm text-info">
            <Sparkles className="h-4 w-4" />
            <span>
              Ranked by trust tier and fit with your brief. Top candidate:{" "}
              <strong>{rows[0].student?.fullName}</strong>.
            </span>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {rows.length === 0 && (
          <Card className="text-sm text-muted">
            No proposals yet. The matching engine notifies students within minutes; expect the first wave in an hour.
          </Card>
        )}
        {rows.map(({ p, student }, i) => (
          <Card key={p.id}>
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                {student?.avatarInitials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/freelancer/${student?.username}`}
                    className="font-semibold hover:underline"
                  >
                    {student?.fullName}
                  </Link>
                  {student?.verified && <BadgeCheck className="h-4 w-4 text-trust-600" />}
                  <Badge tone="brand" className="capitalize">
                    {student?.trustTier}
                  </Badge>
                  {i === 0 && <Badge tone="warning">Best fit</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    {student?.rating} ({student?.reviewsCount})
                  </span>
                  <span>{student?.stream} · {student?.college}</span>
                  <span>{student?.jobsCompleted} jobs completed</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground">{p.coverLetter}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span>
                      Bid: <strong>{formatINR(p.bidAmount)}</strong>
                    </span>
                    <span className="text-muted">{p.deliveryDays}-day delivery</span>
                  </div>
                  <div className="flex gap-2">
                    <Button href="/messages" size="sm" variant="outline">
                      Message
                    </Button>
                    <form action={hireProposal}>
                      <input type="hidden" name="jobId" value={job.id} />
                      <input type="hidden" name="proposalId" value={p.id} />
                      <Button type="submit" size="sm" variant="trust">
                        <Check className="h-4 w-4" /> Hire
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
