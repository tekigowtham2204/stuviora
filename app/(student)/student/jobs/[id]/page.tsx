import { notFound } from "next/navigation";
import { Clock, Users, Sparkles, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/ui/money";
import { TrustTierBadge } from "@/components/ui/trust-tier-badge";
import { getJob, getClientById, listPortfolio } from "@/lib/data/queries";
import { currentStudent } from "@/lib/auth/session";
import { suggestPricing } from "@/lib/pricing/engine";
import { writeProposalDraft } from "@/lib/proposals/writer";
import { buildProposalVariants } from "@/lib/proposals/variants";
import { TIER_BUDGET_CEILING, canAcceptBudget } from "@/lib/trust/score";
import { ProposalForm } from "@/components/feature/proposal-form";

export const metadata = { title: "Job detail" };

export default async function StudentJobDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const client = await getClientById(job.clientId);
  const me = currentStudent();
  const pricing = suggestPricing(job, me.trustTier);
  const portfolio = await listPortfolio(me.id);
  const draft = await writeProposalDraft({
    job,
    student: me,
    portfolio,
    bidAmount: pricing.suggested,
  });
  const variants = buildProposalVariants(draft);
  const ceiling = TIER_BUDGET_CEILING[me.trustTier];
  const bidCeiling = ceiling === Infinity ? null : ceiling;

  return (
    <>
      <PageHeader
        eyebrow={`Posted ${job.createdAgo}`}
        title={job.title}
        subtitle={`by ${client?.companyName ?? "a client"}.`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="font-medium text-[var(--color-ink)]">
                <Money value={job.budgetMin} to={job.budgetMax} />
              </span>
              <span className="inline-flex items-center gap-1 text-[var(--color-ink-muted)]">
                <Clock className="h-4 w-4" /> {job.deadlineDays}-day deadline
              </span>
              <span className="inline-flex items-center gap-1 text-[var(--color-ink-muted)]">
                <Users className="h-4 w-4" /> {job.proposalsCount} proposals so far
              </span>
            </div>
            <div className="mt-6">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
                Brief
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--color-ink)]">
                {job.description}
              </p>
            </div>
            <div className="mt-6">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
                Skills wanted
              </h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-[var(--color-surface-warm)] px-2.5 py-1 text-xs text-[var(--color-ink)]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Bid form */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>Submit your proposal</CardTitle>
              <TrustTierBadge tier={me.trustTier} size="sm" />
            </div>

            {/* Pricing suggestion */}
            <div className="mt-5 rounded-2xl border border-[var(--color-sage-200)] bg-[var(--color-sage-50)] p-4 text-sm">
              <div className="flex items-center gap-2 font-semibold text-[var(--color-sage-900)]">
                <Sparkles className="h-4 w-4" /> AI pricing suggestion
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-2xl font-medium tabular-nums text-[var(--color-ink)]">
                  <Money value={pricing.suggested} />
                </span>
                <span className="text-xs text-[var(--color-ink-muted)]">
                  Range <Money value={pricing.low} compact /> to{" "}
                  <Money value={pricing.high} compact />
                </span>
              </div>
              <ul className="mt-2 space-y-0.5 text-xs text-[var(--color-sage-900)]/90">
                {pricing.reasoning.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>

            <ProposalForm
              jobId={job.id}
              variants={variants}
              pricing={{
                low: pricing.low,
                suggested: pricing.suggested,
                high: pricing.high,
              }}
              bidCeiling={bidCeiling}
              tier={me.trustTier}
              deadlineDays={job.deadlineDays}
              defaultDeliveryDays={Math.max(1, Math.round(job.deadlineDays * 0.8))}
              budgetMaxAboveCap={!canAcceptBudget(me.trustTier, job.budgetMax)}
            />
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <CardTitle>About the client</CardTitle>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-orange)] text-base font-semibold text-[var(--color-brown-900)]">
                {client?.avatarInitials ?? "C"}
              </span>
              <div>
                <div className="font-medium text-[var(--color-ink)]">
                  {client?.companyName ?? "Client"}
                </div>
                <div className="text-xs text-[var(--color-ink-muted)]">{client?.city}</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-[var(--color-ink-muted)]">
              {client?.jobsPosted ?? 0} jobs posted on Stuviora
            </div>
          </Card>
          <Card tint="warm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--color-sage-deep)]" />
              <CardTitle>How payment works</CardTitle>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              When the client hires you they fund Razorpay escrow upfront. You get paid
              85% on approval, with 72-hour auto-release if they do not respond.
            </p>
            <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
              You can withdraw to your bank or UPI once the balance clears. The
              minimum payout is Rs.100.
            </p>
            <Badge tone="sage" className="mt-4">
              Escrow-protected
            </Badge>
          </Card>
        </aside>
      </div>
    </>
  );
}
