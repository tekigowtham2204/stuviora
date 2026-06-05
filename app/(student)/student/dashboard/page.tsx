import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Star,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Stat } from "@/components/ui/stat";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusPill } from "@/components/ui/status-pill";
import { Money } from "@/components/ui/money";
import { TrustTierBadge } from "@/components/ui/trust-tier-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { currentStudent } from "@/lib/auth/session";
import { listStudentOrders, getMatchesForStudent } from "@/lib/data/queries";
import { TRUST_TIERS } from "@/lib/constants";

export const metadata = { title: "Dashboard" };

export default async function StudentDashboard() {
  const me = currentStudent();
  const orders = await listStudentOrders(me.id);
  const matches = await getMatchesForStudent(me.id, { limit: 4 });

  const active = orders.filter(
    (o) => !["completed", "cancelled", "refunded"].includes(o.status)
  );
  const earned = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + Math.round(o.amount * 0.85), 0);
  const nextTier = TRUST_TIERS.find((t) => t.min > me.trustScore);

  return (
    <>
      <PageHeader
        eyebrow="Student dashboard"
        title={`Welcome back, ${me.fullName.split(" ")[0]}.`}
        subtitle="Here is what is happening with your work today, ranked by how well it fits your skills."
        action={
          <Button href="/student/matches" variant="primary">
            <Sparkles className="h-4 w-4" /> See top matches
          </Button>
        }
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={<Wallet className="h-3.5 w-3.5" />}
          label="Earned"
          value={`Rs.${earned.toLocaleString("en-IN")}`}
          sub="From completed orders"
          accent="ink"
        />
        <Stat
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Active"
          value={String(active.length)}
          sub="orders in flight"
          accent="orange"
        />
        <Stat
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          label="Trust score"
          value={`${me.trustScore}`}
          sub={`${me.trustTier} tier`}
          accent="sage"
        />
        <Stat
          icon={<Star className="h-3.5 w-3.5" />}
          label="Rating"
          value={`${me.rating}`}
          sub={`From ${me.reviewsCount} reviews`}
          accent="yellow"
        />
      </div>

      {/* Body */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Active orders */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-medium text-[var(--color-ink)]">
              Active orders
            </h2>
            <Link
              href="/student/orders"
              className="text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-sage-deep)]"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {active.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="h-6 w-6" />}
                title="No active orders right now"
                body="Browse matched jobs or head to your matches to land your next one."
                action={
                  <Button href="/student/matches" variant="sage">
                    See top matches
                  </Button>
                }
              />
            ) : (
              active.map((o) => (
                <Link key={o.id} href={`/student/orders/${o.id}`}>
                  <Card className="flex items-center justify-between gap-4 transition-colors hover:border-[var(--color-sage)]">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-[var(--color-ink)]">
                        {o.jobTitle}
                      </div>
                      <div className="mt-1 text-xs text-[var(--color-ink-muted)]">
                        #{o.id} · <Money value={o.amount} /> · due in {o.deadlineDays}d
                      </div>
                    </div>
                    <OrderStatusPill status={o.status} />
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Side: trust + matches */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--color-sage-deep)]" />
              <CardTitle>Trust tier</CardTitle>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <TrustTierBadge tier={me.trustTier} />
              <span className="font-display text-2xl tabular-nums text-[var(--color-ink)]">
                {me.trustScore}
                <span className="ml-1 text-sm text-[var(--color-ink-faint)]">/100</span>
              </span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--color-surface-warm)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-sage)] to-[var(--color-sage-deep)] transition-all"
                style={{ width: `${me.trustScore}%` }}
              />
            </div>
            {nextTier && (
              <p className="mt-3 text-xs leading-relaxed text-[var(--color-ink-muted)]">
                <span className="font-medium text-[var(--color-ink)]">
                  {nextTier.min - me.trustScore} points
                </span>{" "}
                to <span className="font-medium">{nextTier.name}</span>. Unlocks
                higher-budget jobs.
              </p>
            )}
            <Button href="/student/trust" variant="ghost" size="sm" className="mt-4">
              How your score is built →
            </Button>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--color-orange)]" />
                <CardTitle>Matched for you</CardTitle>
              </div>
              <Link
                href="/student/matches"
                className="text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-sage-deep)]"
              >
                See all →
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {matches.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-muted)]">
                  No open jobs match right now. Check back soon.
                </p>
              ) : (
                matches.slice(0, 3).map(({ job, breakdown }) => (
                  <Link
                    key={job.id}
                    href={`/student/jobs/${job.id}`}
                    className="block"
                  >
                    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-warm)] p-4 transition-colors hover:border-[var(--color-sage)]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="line-clamp-1 text-sm font-medium text-[var(--color-ink)]">
                          {job.title}
                        </div>
                        <Badge tone="sage" className="shrink-0">
                          {breakdown.score}
                        </Badge>
                      </div>
                      <div className="mt-1.5 text-xs text-[var(--color-ink-muted)]">
                        <Money value={job.budgetMin} to={job.budgetMax} compact /> ·{" "}
                        {job.proposalsCount} proposals · due in {job.deadlineDays}d
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            {matches.length > 0 && (
              <Button href="/student/matches" variant="sage" size="sm" className="mt-4 w-full">
                Open my matches <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
