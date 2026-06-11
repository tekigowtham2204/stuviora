import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Star,
  CheckCircle2,
  GraduationCap,
  FileText,
  Package,
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
import { listStudentOrders, getMatchesForStudent, listPortfolio } from "@/lib/data/queries";
import { computeProfileCompleteness } from "@/lib/students/completeness";
import { passedSkillBadges } from "@/lib/demo/state";
import { TRUST_TIERS } from "@/lib/constants";

export const metadata = { title: "Dashboard" };

export default async function StudentDashboard() {
  const me = currentStudent();
  const portfolio = await listPortfolio(me.id);
  const completeness = computeProfileCompleteness({
    student: me,
    portfolioCount: portfolio.length,
    hasSkillBadge: passedSkillBadges.size > 0,
    hasPayoutDetails: true, // demo wallet has UPI on file
  });
  const orders = await listStudentOrders(me.id);
  const { matches } = await getMatchesForStudent(me.id, { limit: 4 });

  const active = orders.filter(
    (o) => !["completed", "cancelled", "refunded"].includes(o.status)
  );
  const earned = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + Math.round(o.amount * 0.85), 0);
  const nextTier = TRUST_TIERS.find((t) => t.min > me.trustScore);

  // The student is "new" when they have never run the loop. We pick a
  // different layout that walks them to their first paid order rather
  // than rendering a graveyard of zero stats.
  const isNewStudent =
    me.jobsCompleted === 0 && orders.length === 0 && active.length === 0;

  if (isNewStudent) {
    return <NewStudentDashboard name={me.fullName} skills={me.skills} matchesAvailable={matches.length} />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Student dashboard"
        title={`Welcome back, ${me.fullName.split(" ")[0]}.`}
        subtitle="Here is what is happening with your work today, ranked by how well it fits your skills."
        action={
          <Button href="/student/matches" variant="primary">
            <Sparkles className="h-4 w-4" />

      {completeness.percent < 100 && completeness.next && (
        <Card surface="flat" tint="warm" className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-[var(--color-ink)]">
                Profile {completeness.percent}% complete
              </div>
              <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                Complete profiles get matched first. Next up: {completeness.next.label.toLowerCase()}.
              </p>
            </div>
            <Button href={completeness.next.href} variant="sage" size="sm">
              {completeness.next.label}
            </Button>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-line)]"
            role="progressbar"
            aria-valuenow={completeness.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile completeness"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-sage)] to-[var(--color-sage-deep)]"
              style={{ width: `${completeness.percent}%` }}
            />
          </div>
        </Card>
      )} See top matches
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

/**
 * Zero-state dashboard for a student who has never run the loop.
 * Closes student-audit.md gaps #17 (new-user dashboard) and
 * #18 (next-action recommender). Renders a single welcome hero
 * with a 3-step "to first paid job" guide.
 */
function NewStudentDashboard({
  name,
  skills,
  matchesAvailable,
}: {
  name: string;
  skills: string[];
  matchesAvailable: number;
}) {
  const hasSkills = skills.length > 0;
  const steps = [
    {
      n: 1,
      icon: GraduationCap,
      title: "Finish your profile",
      body: hasSkills
        ? "Skills picked. Add a short headline + bio so clients know who you are."
        : "Pick the skills you want to sell. Three to six is plenty.",
      cta: hasSkills ? "Add headline + bio" : "Pick skills",
      href: "/student/onboarding",
      done: false,
    },
    {
      n: 2,
      icon: Package,
      title: "List your first service",
      body: "Three tiers, your prices. Doubles the chance a client hires you in week 1.",
      cta: "List a service",
      href: "/student/services/new",
      done: false,
    },
    {
      n: 3,
      icon: FileText,
      title: "Bid on a matched job",
      body:
        matchesAvailable > 0
          ? `${matchesAvailable} matched job${matchesAvailable === 1 ? "" : "s"} ready. AI drafts the proposal for you.`
          : "Browse open jobs and send your first proposal.",
      cta: matchesAvailable > 0 ? "Open my matches" : "Browse jobs",
      href: matchesAvailable > 0 ? "/student/matches" : "/student/jobs",
      done: false,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Welcome to Stuviora"
        title={`Hi ${name.split(" ")[0]}, let's land your first paid job.`}
        subtitle="Three steps. Most students complete a first job within 7 days of signing up. Your payout lands by UPI in under 5 minutes."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.n} className="flex h-full flex-col p-6">
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl text-[var(--color-ink-faint)]">
                0{step.n}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-sage)] text-[var(--color-brown-900)]">
                <step.icon className="h-5 w-5" />
              </span>
            </div>
            <h3 className="mt-4 font-display text-lg font-medium text-[var(--color-ink)]">
              {step.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              {step.body}
            </p>
            <Button href={step.href} variant="sage" size="sm" className="mt-5 w-full">
              {step.cta} <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>

      <Card tint="warm" surface="flat" className="mt-8">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-orange)] text-[var(--color-brown-900)]">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>What happens after your first hire</CardTitle>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Client funds Razorpay escrow up front, so the money is locked the
              moment you start. You deliver. Claude AI reviews the work
              against the brief, and only passing work reaches the client.
              When the client approves, 85% (Rs.8,500 on a Rs.10,000 job)
              lands in your wallet in under 5 minutes via UPI.
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}
