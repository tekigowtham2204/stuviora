import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Stat } from "@/components/ui/stat";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { currentStudent } from "@/lib/auth/session";
import { listStudentOrders, listOpenJobs } from "@/lib/data/queries";
import { ORDER_STATUS_META } from "@/lib/status";
import { formatINR } from "@/lib/utils";
import { TRUST_TIERS } from "@/lib/constants";

export const metadata = { title: "Dashboard" };

export default async function StudentDashboard() {
  const me = currentStudent();
  const orders = await listStudentOrders(me.id);
  const jobs = (await listOpenJobs()).slice(0, 3);

  const active = orders.filter((o) => !["completed", "cancelled", "refunded"].includes(o.status));
  const monthEarnings = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + Math.round(o.amount * 0.85), 0);
  const nextTier = TRUST_TIERS.find((t) => t.min > me.trustScore);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${me.fullName.split(" ")[0]}`}
        subtitle="Here's what's happening with your work today."
        action={<Button href="/student/jobs">Find work <ArrowRight className="h-4 w-4" /></Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Earned (completed)" value={formatINR(monthEarnings)} sub="85% of job value" />
        <Stat label="Active orders" value={String(active.length)} sub="in progress" />
        <Stat label="Trust score" value={`${me.trustScore}`} sub={`${me.trustTier} tier`} />
        <Stat label="Rating" value={`${me.rating}★`} sub={`${me.reviewsCount} reviews`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Active orders */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <CardTitle>Active orders</CardTitle>
            <Link href="/student/orders" className="text-sm font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {active.length === 0 && (
              <Card className="text-sm text-muted">No active orders. Browse jobs to land your next one.</Card>
            )}
            {active.map((o) => {
              const meta = ORDER_STATUS_META[o.status];
              return (
                <Link key={o.id} href={`/student/orders/${o.id}`}>
                  <Card className="flex items-center justify-between gap-4 transition-colors hover:border-brand-300">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{o.jobTitle}</div>
                      <div className="mt-0.5 text-xs text-muted">
                        #{o.id} · {formatINR(o.amount)} · due in {o.deadlineDays}d
                      </div>
                    </div>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Side: trust tier + matched jobs */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <CardTitle>Trust tier</CardTitle>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-semibold capitalize">{me.trustTier}</span>
              <span className="text-sm text-muted">{me.trustScore}/100</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-surface-muted">
              <div className="h-2 rounded-full bg-brand-500" style={{ width: `${me.trustScore}%` }} />
            </div>
            {nextTier && (
              <p className="mt-2 text-xs text-muted">
                {nextTier.min - me.trustScore} points to <span className="font-medium">{nextTier.name}</span> — unlocks higher-budget jobs.
              </p>
            )}
          </Card>

          <Card>
            <CardTitle>Matched for you</CardTitle>
            <div className="mt-3 space-y-3">
              {jobs.map((j) => (
                <Link key={j.id} href={`/student/jobs/${j.id}`} className="block">
                  <div className="rounded-lg border border-border p-3 transition-colors hover:border-brand-300">
                    <div className="line-clamp-1 text-sm font-medium">{j.title}</div>
                    <div className="mt-1 text-xs text-muted">
                      {formatINR(j.budgetMin)}–{formatINR(j.budgetMax)} · {j.proposalsCount} proposals
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
