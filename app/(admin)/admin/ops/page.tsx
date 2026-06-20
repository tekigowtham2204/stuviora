import { Activity, CheckCircle2, Circle, Clock, Zap } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { services } from "@/lib/env";
import { reconcileCommissions } from "@/lib/payments/reconcile";
import { LLM_TIERS } from "@/lib/llm/models";
import { platformModel } from "@/lib/demo/state";
import { setModelTier } from "@/app/actions/admin";

export const metadata = { title: "Ops" };

const INTEGRATIONS: { key: keyof typeof services; label: string }[] = [
  { key: "supabase", label: "Supabase (DB + Auth + Storage)" },
  { key: "razorpay", label: "Razorpay Route (payments)" },
  { key: "llm", label: "LLM (AI quality gate)" },
  { key: "resend", label: "Resend (email)" },
  { key: "inngest", label: "Inngest (background jobs)" },
  { key: "upstash", label: "Upstash (rate limit)" },
  { key: "meilisearch", label: "Meilisearch (search)" },
  { key: "sentry", label: "Sentry (errors)" },
  { key: "posthog", label: "PostHog (analytics)" },
];

const JOBS: { name: string; trigger: string; kind: "cron" | "event" }[] = [
  { name: "escrowAutoRelease", trigger: "every 30 min", kind: "cron" },
  { name: "commissionReconciler", trigger: "daily 02:00 IST", kind: "cron" },
  { name: "weeklyEarningsDigest", trigger: "Mon 09:00 IST", kind: "cron" },
  { name: "tdsThresholdChecker", trigger: "monthly", kind: "cron" },
  { name: "searchReindex", trigger: "on publish + nightly", kind: "cron" },
  { name: "aiQualityCheck", trigger: "on order submit", kind: "event" },
  { name: "smartMatchFanout", trigger: "on job posted", kind: "event" },
  { name: "trustScoreRecalc", trigger: "on review/order", kind: "event" },
];

export default async function AdminOpsPage() {
  const liveCount = INTEGRATIONS.filter((i) => services[i.key]).length;

  // Demo reconciliation over a small clean fixture so the panel shows real
  // numbers; live mode reports against commission_events.
  const recon = reconcileCommissions(
    [
      { eventId: "trf_a", orderId: "SV-1021", amount: 4250, status: "processed" },
      { eventId: "trf_b", orderId: "SV-0998", amount: 5780, status: "processed" },
    ],
    [
      { orderId: "SV-1021", orderAmount: 5000, commission: 750 },
      { orderId: "SV-0998", orderAmount: 6800, commission: 1020 },
    ]
  );

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Ops dashboard."
        subtitle="Integration health, background jobs, and the daily payout reconciliation."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat
          label="Live integrations"
          value={`${liveCount} of ${INTEGRATIONS.length}`}
          icon={<Zap className="h-6 w-6" />}
        />
        <Stat
          label="Background jobs"
          value={String(JOBS.length)}
          icon={<Clock className="h-6 w-6" />}
        />
        <Stat
          label="Reconciliation"
          value={recon.ok ? "Clean" : `${recon.issues.length} issue(s)`}
          icon={<Activity className="h-6 w-6" />}
        />
      </div>

      <Card className="mt-6">
        <CardTitle>AI model</CardTitle>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Powers the quality gate and AI assists. Provider:{" "}
          {services.groq ? "Groq" : "Demo (no key)"}. Labels are tiers; the
          real model id is shown on each.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {LLM_TIERS.map((t) => {
            const active = platformModel.tier === t.id;
            return (
              <form
                key={t.id}
                action={setModelTier}
                className={
                  "rounded-2xl border p-4 " +
                  (active
                    ? "border-[var(--color-sage-deep)] bg-[var(--color-sage-50)]"
                    : "border-[var(--color-line)]")
                }
              >
                <input type="hidden" name="tier" value={t.id} />
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--color-ink)]">
                    {t.label}
                  </span>
                  {active && <Badge tone="sage">Active</Badge>}
                </div>
                <div className="mt-1 break-all font-mono text-xs text-[var(--color-ink-muted)]">
                  {t.model}
                </div>
                <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
                  {t.note}
                </p>
                {!active && (
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                  >
                    Use
                  </Button>
                )}
              </form>
            );
          })}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Integration health</CardTitle>
          <ul className="mt-4 space-y-2.5">
            {INTEGRATIONS.map((i) => {
              const live = services[i.key];
              return (
                <li key={i.key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-[var(--color-ink)]">
                    {live ? (
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
                    ) : (
                      <Circle className="h-4 w-4 text-[var(--color-ink-faint)]" />
                    )}
                    {i.label}
                  </span>
                  <Badge tone={live ? "sage" : "neutral"}>
                    {live ? "Live" : "Demo"}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardTitle>Background jobs</CardTitle>
          <ul className="mt-4 space-y-2.5">
            {JOBS.map((j) => (
              <li key={j.name} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs text-[var(--color-ink)]">
                  {j.name}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-ink-muted)]">
                    {j.trigger}
                  </span>
                  <Badge tone={j.kind === "cron" ? "yellow" : "info"}>
                    {j.kind}
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle>Payout reconciliation</CardTitle>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Checked {recon.ordersChecked} order(s) across {recon.settledTransfers}{" "}
            settled transfer(s). The guardrail: zero double payouts, ever.
          </p>
          {recon.ok ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-sage-900)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
              No drift detected.
            </div>
          ) : (
            <ul className="mt-4 space-y-1.5 text-sm">
              {recon.issues.map((issue, i) => (
                <li key={i} className="text-[var(--color-danger-deep)]">
                  <span className="font-mono text-xs">{issue.kind}</span> ·{" "}
                  {issue.orderId}: {issue.detail}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
