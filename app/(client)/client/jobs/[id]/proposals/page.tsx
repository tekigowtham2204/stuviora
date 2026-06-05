import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, BadgeCheck, Sparkles, Check, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { TrustTierBadge } from "@/components/ui/trust-tier-badge";
import {
  getJob,
  listJobProposals,
  getStudentById,
  getMatchesForJob,
} from "@/lib/data/queries";
import { hireProposal } from "@/app/actions/jobs";
import { rankStudentsForJob } from "@/lib/matching/engine";

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

  // Re-rank proposals by AI-fit score (same engine as /student/matches).
  const studentsWithProposals = rows
    .map((r) => r.student)
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const ranked = rankStudentsForJob(job, studentsWithProposals);
  const rankedRows = rows
    .map((r) => {
      const rank = ranked.find((x) => x.student.id === r.student?.id);
      return { ...r, breakdown: rank?.breakdown };
    })
    .sort((a, b) => (b.breakdown?.score ?? 0) - (a.breakdown?.score ?? 0));

  // Top matched students who haven't proposed yet.
  const topSuggested = (await getMatchesForJob(job.id, { limit: 5 })).filter(
    (m) => m.breakdown.score >= 50
  );

  return (
    <>
      <PageHeader
        eyebrow="Proposals"
        title={job.title}
        subtitle={`${proposals.length} proposals received. Budget ${
          job.budgetMin
        } to ${job.budgetMax} rupees.`}
      />

      {/* Top matched students (proactive) */}
      {topSuggested.length > 0 && (
        <Card surface="raised" tint="warm" className="mb-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--color-orange)]" />
              <CardTitle>Top matched students for this brief</CardTitle>
            </div>
            <span className="text-xs text-[var(--color-ink-muted)]">
              Ranked by AI fit. Reach out before proposals close.
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {topSuggested.map(({ student, breakdown }) => (
              <Link
                key={student.id}
                href={`/freelancer/${student.username}`}
                className="group rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 transition-all hover:border-[var(--color-orange)]"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-sage)] text-sm font-semibold text-[var(--color-brown-900)]">
                    {student.avatarInitials}
                  </span>
                  <Badge tone="sage" className="ml-auto">
                    {breakdown.score}
                  </Badge>
                </div>
                <div className="mt-3 truncate text-sm font-medium text-[var(--color-ink)]">
                  {student.fullName}
                </div>
                <div className="truncate text-xs text-[var(--color-ink-muted)]">
                  {student.college}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <TrustTierBadge tier={student.trustTier} size="sm" />
                  <span className="text-xs text-[var(--color-ink)] group-hover:text-[var(--color-orange)]">
                    Message →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Ranking banner */}
      {rankedRows.length > 0 && rankedRows[0].student && (
        <Card surface="flat" tint="sage" className="mb-6">
          <div className="flex items-center gap-2 text-sm text-[var(--color-sage-900)]">
            <Sparkles className="h-4 w-4" />
            <span>
              Ranked by AI fit with your brief. Top candidate:{" "}
              <strong>{rankedRows[0].student.fullName}</strong>.
            </span>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {rankedRows.length === 0 && (
          <Card>
            <p className="text-sm text-[var(--color-ink-muted)]">
              No proposals yet. The smart-match engine notifies the top 20 students within
              minutes of posting. Expect the first wave in an hour.
            </p>
          </Card>
        )}
        {rankedRows.map(({ p, student, breakdown }, i) => (
          <Card key={p.id}>
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-sage)] font-semibold text-[var(--color-brown-900)]">
                {student?.avatarInitials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/freelancer/${student?.username}`}
                    className="font-display text-lg font-medium text-[var(--color-ink)] hover:text-[var(--color-sage-deep)]"
                  >
                    {student?.fullName}
                  </Link>
                  {student?.verified && (
                    <BadgeCheck className="h-4 w-4 text-[var(--color-sage-deep)]" />
                  )}
                  {student && <TrustTierBadge tier={student.trustTier} size="sm" />}
                  {i === 0 && (
                    <Badge tone="orange">
                      <Sparkles className="h-3 w-3" /> Best fit
                    </Badge>
                  )}
                  {breakdown && (
                    <Badge tone="sage">
                      AI fit {breakdown.score}
                    </Badge>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-ink-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-[var(--color-yellow)] text-[var(--color-yellow-deep)]" />
                    {student?.rating} ({student?.reviewsCount})
                  </span>
                  <span>
                    {student?.stream} · {student?.college}
                  </span>
                  <span>{student?.jobsCompleted} jobs completed</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink)]">
                  {p.coverLetter}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-line)] pt-4">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                    <span className="text-[var(--color-ink)]">
                      Bid: <Money value={p.bidAmount} />
                    </span>
                    <span className="text-[var(--color-ink-muted)]">
                      {p.deliveryDays}-day delivery
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button href="/messages" size="sm" variant="outline">
                      <MessageCircle className="h-3.5 w-3.5" /> Message
                    </Button>
                    <form action={hireProposal}>
                      <input type="hidden" name="jobId" value={job.id} />
                      <input type="hidden" name="proposalId" value={p.id} />
                      <Button type="submit" size="sm" variant="primary">
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
