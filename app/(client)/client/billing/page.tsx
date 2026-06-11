import { CheckCircle2, Crown } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CLIENT_PLANS, type ClientPlan } from "@/lib/monetization/subscriptions";
import { startSubscription, cancelSubscription } from "@/app/actions/monetization";

export const metadata = { title: "Billing" };

export default async function ClientBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribed?: string; error?: string }>;
}) {
  const { subscribed, error } = await searchParams;
  // Demo: current plan is free unless a flash says otherwise. Live: read
  // client_subscriptions for the session client.
  const currentPlan: ClientPlan = (subscribed as ClientPlan) || "free";

  return (
    <>
      <PageHeader
        eyebrow="Billing"
        title="Hire at volume, pay less per hire."
        subtitle="Subscriptions reduce the commission rate and bundle featured posts. Cancel any time."
      />

      {subscribed && (
        <Card role="status" aria-live="polite" surface="flat" tint="sage" className="mb-6 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <span className="text-[var(--color-sage-900)]">
            {subscribed === "free"
              ? "Subscription cancelled. You are on the Free plan."
              : `You are on the ${subscribed} plan. In live mode billing renews monthly via Razorpay.`}
          </span>
        </Card>
      )}
      {error && (
        <Card surface="flat" tint="warm" className="mb-6 text-sm text-[var(--color-orange-900)]">
          That plan does not exist.
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {CLIENT_PLANS.map((p) => {
          const active = p.id === currentPlan;
          return (
            <Card key={p.id} surface={p.id === "growth" ? "glow" : "raised"}>
              <div className="flex items-center justify-between">
                <CardTitle>{p.name}</CardTitle>
                {p.id === "growth" && (
                  <Badge tone="yellow"><Crown className="h-3 w-3" /> Popular</Badge>
                )}
                {active && <Badge tone="sage">Current</Badge>}
              </div>
              <div className="mt-3 font-display text-3xl font-medium tabular-nums text-[var(--color-ink)]">
                {p.monthlyRupees === 0 ? "Free" : `Rs.${p.monthlyRupees.toLocaleString("en-IN")}`}
                {p.monthlyRupees > 0 && (
                  <span className="text-sm text-[var(--color-ink-muted)]"> /month</span>
                )}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-[var(--color-ink-muted)]">
                <li>Commission: {Math.round((p.commissionRate ?? 0.15) * 100)}%</li>
                <li>{p.featuredJobsIncluded} featured post(s) included monthly</li>
                <li>Up to {p.concurrentJobs} concurrent open jobs</li>
                {p.premiumFilters && <li>Gold+ talent filters</li>}
                {p.prioritySupport && <li>Priority dispute queue</li>}
              </ul>
              {active ? (
                p.id !== "free" && (
                  <form action={cancelSubscription} className="mt-5">
                    <Button type="submit" variant="secondary" size="sm" className="w-full">
                      Cancel subscription
                    </Button>
                  </form>
                )
              ) : (
                <form action={startSubscription} className="mt-5">
                  <input type="hidden" name="plan" value={p.id} />
                  <Button
                    type="submit"
                    variant={p.id === "free" ? "secondary" : "primary"}
                    size="sm"
                    className="w-full"
                  >
                    {p.id === "free" ? "Switch to Free" : `Get ${p.name}`}
                  </Button>
                </form>
              )}
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-[var(--color-ink-faint)]">
        Prices exclude GST. Subscription billing activates with live Razorpay
        keys; until then this page records your selection for the demo.
      </p>
    </>
  );
}
