import Link from "next/link";
import { Sparkles, MessageCircle, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Money } from "@/components/ui/money";
import { TrustTierBadge } from "@/components/ui/trust-tier-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { currentClient } from "@/lib/auth/session";
import { listClientJobs, getMatchesForJob } from "@/lib/data/queries";

export const metadata = { title: "Suggested talent" };

export default async function ClientMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const me = currentClient();
  const { job: selectedJobId } = await searchParams;
  const jobs = (await listClientJobs(me.id)).filter((j) => j.status === "open");
  const activeJob = jobs.find((j) => j.id === selectedJobId) ?? jobs[0];

  return (
    <>
      <PageHeader
        eyebrow="Smart matching"
        title="Suggested talent."
        subtitle="The students our AI thinks will deliver this job best. Ranked by skill fit, pricing, trust, and availability."
        action={
          <Button href="/client/post-job" variant="primary">
            Post another job
          </Button>
        }
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-6 w-6" />}
          title="No open jobs yet"
          body="Post your first brief to see ranked talent suggestions here."
          action={
            <Button href="/client/post-job" variant="primary">
              Post a job
            </Button>
          }
        />
      ) : (
        <>
          {/* Job selector tabs */}
          <div className="mb-8 flex flex-wrap gap-2">
            {jobs.map((j) => (
              <Link
                key={j.id}
                href={`/client/matches?job=${j.id}`}
                className={
                  "inline-flex max-w-xs items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors " +
                  (activeJob?.id === j.id
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-cream)]"
                    : "border-[var(--color-line-strong)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-ink)]")
                }
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                <span className="truncate">{j.title}</span>
              </Link>
            ))}
          </div>

          {activeJob && <JobMatches jobId={activeJob.id} />}
        </>
      )}
    </>
  );
}

async function JobMatches({ jobId }: { jobId: string }) {
  const { matches } = await getMatchesForJob(jobId, { limit: 20 });
  if (matches.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="h-6 w-6" />}
        title="No suggested students yet"
        body="We are still indexing students for this brief. Refresh in a few minutes."
      />
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {matches.map(({ student, breakdown }, i) => (
        <Reveal key={student.id} index={i}>
          <Card className="flex h-full flex-col p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-sage)] text-base font-semibold text-[var(--color-brown-900)]">
                {student.avatarInitials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-display text-base font-medium text-[var(--color-ink)]">
                    {student.fullName}
                  </span>
                </div>
                <div className="truncate text-xs text-[var(--color-ink-muted)]">
                  {student.stream} · {student.college}
                </div>
              </div>
              <Badge tone={breakdown.score >= 70 ? "sage" : "yellow"}>
                <Sparkles className="h-3 w-3" />
                {breakdown.score}
              </Badge>
            </div>

            <p className="mt-3 line-clamp-2 text-sm text-[var(--color-ink-muted)]">
              {student.headline}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {student.skills.slice(0, 5).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-[var(--color-surface-warm)] px-2.5 py-1 text-xs text-[var(--color-ink)]"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Breakdown */}
            <div className="mt-5 space-y-2">
              {breakdown.components.map((c) => (
                <div key={c.key} className="flex items-center gap-2 text-xs">
                  <span className="w-20 shrink-0 text-[var(--color-ink-muted)]">{c.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-warm)]">
                    <div
                      className={
                        "h-full rounded-full " +
                        (c.key === "skill"
                          ? "bg-[var(--color-sage-deep)]"
                          : c.key === "budget"
                          ? "bg-[var(--color-orange)]"
                          : c.key === "trust"
                          ? "bg-[var(--color-yellow-deep)]"
                          : "bg-[var(--color-brown-500)]")
                      }
                      style={{ width: `${c.value}%` }}
                    />
                  </div>
                  <span className="w-7 shrink-0 text-right font-medium tabular-nums text-[var(--color-ink)]">
                    {c.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-[var(--color-line)] pt-4">
              <div className="flex items-center gap-2">
                <TrustTierBadge tier={student.trustTier} size="sm" />
                <span className="text-xs text-[var(--color-ink-muted)]">
                  from <Money value={student.hourlyFrom} compact />/hr
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/freelancer/${student.username}`}
                  className="text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-sage-deep)]"
                >
                  Profile →
                </Link>
                <Button href="/messages" variant="outline" size="sm">
                  <MessageCircle className="h-3.5 w-3.5" /> Message
                </Button>
              </div>
            </div>
          </Card>
        </Reveal>
      ))}
    </div>
  );
}
