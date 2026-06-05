import Link from "next/link";
import { Sparkles, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Money } from "@/components/ui/money";
import { EmptyState } from "@/components/ui/empty-state";
import { currentStudent } from "@/lib/auth/session";
import { getMatchesForStudent } from "@/lib/data/queries";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { MATCH_WEIGHTS } from "@/lib/matching/engine";

export const metadata = { title: "Matches" };

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const me = currentStudent();
  const params = await searchParams;
  const category = params.category;
  const matches = await getMatchesForStudent(me.id, { limit: 20, category });

  return (
    <>
      <PageHeader
        eyebrow="Smart matching"
        title="Top matches for you."
        subtitle={`Ranked by skill fit (${Math.round(
          MATCH_WEIGHTS.skill * 100
        )}%), budget fit (${Math.round(
          MATCH_WEIGHTS.budget * 100
        )}%), trust (${Math.round(
          MATCH_WEIGHTS.trust * 100
        )}%), and availability (${Math.round(
          MATCH_WEIGHTS.availability * 100
        )}%).`}
        action={
          <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
            <Sparkles className="h-4 w-4 text-[var(--color-orange)]" />
            {matches.length} matches
          </div>
        }
      />

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 pr-1 text-xs uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
          <Filter className="h-3 w-3" /> Filter
        </span>
        <CategoryChip label="All" href="/student/matches" active={!category} />
        {SERVICE_CATEGORIES.map((c) => (
          <CategoryChip
            key={c.slug}
            label={c.name}
            href={`/student/matches?category=${c.slug}`}
            active={category === c.slug}
          />
        ))}
      </div>

      {matches.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="No matches in this category yet"
          body="Try a different filter, or check back as new jobs come in."
          action={
            <Button href="/student/matches" variant="sage">
              Clear filter
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map(({ job, breakdown }, i) => (
            <Reveal key={job.id} index={i}>
              <Link href={`/student/jobs/${job.id}`} className="block h-full">
                <Card className="group flex h-full flex-col p-6 transition-all hover:border-[var(--color-sage)] hover:shadow-[var(--shadow-card-lg)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-medium leading-tight text-[var(--color-ink)] line-clamp-2">
                        {job.title}
                      </h3>
                      <div className="mt-1 text-xs text-[var(--color-ink-muted)]">
                        {job.createdAgo} · {job.proposalsCount} proposals
                      </div>
                    </div>
                    <ScoreChip score={breakdown.score} />
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm text-[var(--color-ink-muted)]">
                    {job.description}
                  </p>

                  {/* Skill chips */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-[var(--color-surface-warm)] px-2.5 py-1 text-xs text-[var(--color-ink)]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Breakdown bars */}
                  <div className="mt-5 grid grid-cols-4 gap-2">
                    {breakdown.components.map((c) => (
                      <div key={c.key} className="text-center">
                        <div className="mx-auto h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-warm)]">
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
                        <div className="mt-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--color-ink-faint)]">
                          {c.label}
                        </div>
                        <div className="text-xs font-medium tabular-nums text-[var(--color-ink)]">
                          {c.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer: budget + deadline */}
                  <div className="mt-auto flex items-center justify-between border-t border-[var(--color-line)] pt-4 text-sm">
                    <Money value={job.budgetMin} to={job.budgetMax} compact />
                    <span className="text-xs text-[var(--color-ink-muted)]">
                      Due in {job.deadlineDays}d
                    </span>
                  </div>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}

function ScoreChip({ score }: { score: number }) {
  const tone =
    score >= 80 ? "sage" : score >= 60 ? "yellow" : score >= 40 ? "orange" : "neutral";
  return (
    <div className="text-right">
      <Badge tone={tone}>
        <Sparkles className="h-3 w-3" />
        {score}
      </Badge>
    </div>
  );
}

function CategoryChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
        (active
          ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-cream)]"
          : "border-[var(--color-line-strong)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-ink)]")
      }
    >
      {label}
    </Link>
  );
}
