import Link from "next/link";
import { Clock, Users, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { Money } from "@/components/ui/money";
import { EmptyState } from "@/components/ui/empty-state";
import { getMatchesForStudent } from "@/lib/data/queries";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { currentStudent } from "@/lib/auth/session";
import { isFeaturedActive } from "@/lib/monetization/featured";
import { KeyNav } from "@/components/feature/key-nav";
import { saveSearch } from "@/app/actions/jobs";
import { getMarketSignals } from "@/lib/data/queries";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Browse jobs" };

export default async function StudentJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const me = currentStudent();
  // Ranked by the same engine as /student/matches so the two stay in sync.
  const { matches: ranked } = await getMatchesForStudent(me.id, { limit: 50, category });
  const signals = await getMarketSignals(ranked.map((r) => r.job.id));

  return (
    <>
      <PageHeader
        eyebrow="Open jobs"
        title="Browse open jobs."
        subtitle="Ranked by AI fit with your skills, trust, and availability. The same engine that powers your matches feed."
      />

      <div className="mb-8 flex flex-wrap gap-2">
        <Chip href="/student/jobs" active={!category} label="All" />
        {SERVICE_CATEGORIES.map((c) => (
          <Chip
            key={c.slug}
            href={`/student/jobs?category=${c.slug}`}
            active={category === c.slug}
            label={c.name}
          />
        ))}
      </div>

      <div className="mb-5 flex items-center gap-3">
        <form action={saveSearch}>
          <input type="hidden" name="category" value={category ?? "all"} />
          <button
            type="submit"
            className="rounded-full border border-[var(--color-line-strong)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-warm)]"
          >
            Save this search
          </button>
        </form>
        {search === "saved" && (
          <span role="status" aria-live="polite" className="text-xs text-[var(--color-sage-900)]">
            Saved. You will get match alerts for this filter once email lands.
          </span>
        )}
        <span className="ml-auto hidden text-[11px] text-[var(--color-ink-faint)] sm:block">
          Tip: j / k to move between jobs
        </span>
      </div>
      <KeyNav />

      {ranked.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="No open jobs in this category"
          body="Try another category or check back as new briefs come in."
        />
      ) : (
        <div className="grid gap-4">
          {ranked.map(({ job: j, breakdown }, i) => (
            <Reveal key={j.id} index={i}>
              <Link href={`/student/jobs/${j.id}`} data-keynav className="rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sage-deep)]">
                <Card className="transition-all hover:border-[var(--color-sage)] hover:shadow-[var(--shadow-card-lg)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {isFeaturedActive(j.featuredUntil) && (
                        <Badge tone="yellow" className="mb-2">Featured</Badge>
                      )}
                      <h3 className="font-display text-lg font-medium leading-snug text-[var(--color-ink)]">
                        {j.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                        {j.description}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-ink-muted)]">
                        <span className="inline-flex items-center gap-1">
                          <Money value={j.budgetMin} to={j.budgetMax} compact />
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {j.deadlineDays}d
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {j.proposalsCount} proposals
                        </span>
                        {signals.get(j.id)?.avgBid && (
                          <span className="inline-flex items-center gap-1">
                            Avg bid <Money value={signals.get(j.id)!.avgBid!} compact />
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[var(--color-sage-900)]">
                          <ShieldCheck className="h-3.5 w-3.5" /> Escrow protected
                        </span>
                        <span>{j.createdAgo}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {j.skills.map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-[var(--color-surface-warm)] px-2.5 py-1 text-xs text-[var(--color-ink)]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge tone={breakdown.score >= 60 ? "sage" : breakdown.score >= 40 ? "yellow" : "neutral"}>
                        <Sparkles className="h-3 w-3" />
                        {breakdown.score}
                      </Badge>
                      <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
                        Match
                      </div>
                    </div>
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

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
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
