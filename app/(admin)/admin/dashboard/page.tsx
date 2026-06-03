import Link from "next/link";
import { Scale, ArrowRight, TrendingUp, Wallet, Users, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { getPlatformMetrics, listDisputeQueue } from "@/lib/data/queries";
import { DISPUTE_STATUS_META } from "@/lib/status";
import { isEscalated } from "@/lib/disputes/engine";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "Admin overview" };

export default async function AdminDashboard() {
  const m = await getPlatformMetrics();
  const queue = await listDisputeQueue();
  const maxRev = Math.max(...m.dailyRevenue.map((d) => d.amount));

  return (
    <>
      <PageHeader
        title="Platform overview"
        subtitle="Live GMV, revenue, escrow, and the dispute queue."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="GMV (lifetime)" value={formatINR(m.gmv)} sub="gross merchandise value" />
        <Stat label="Net revenue" value={formatINR(m.revenueNet)} sub="commission after GST" />
        <Stat label="GST collected" value={formatINR(m.gstCollected)} sub="18% on fees" />
        <Stat label="TDS withheld" value={formatINR(m.tdsWithheld)} sub="Sec. 194H" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat icon={<ShoppingBag className="h-4 w-4" />} label="Active orders" value={String(m.activeOrders)} />
        <MiniStat icon={<Scale className="h-4 w-4" />} label="Open disputes" value={String(m.openDisputes)} tone="danger" />
        <MiniStat icon={<Wallet className="h-4 w-4" />} label="Escrow held" value={formatINR(m.escrowHeld)} />
        <MiniStat icon={<Users className="h-4 w-4" />} label="Users" value={`${m.students + m.clients}`} sub={`${m.students} students · ${m.clients} clients`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Daily revenue sparkline */}
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Daily revenue · last 14 days</CardTitle>
            <span className="flex items-center gap-1 text-xs font-medium text-success">
              <TrendingUp className="h-3.5 w-3.5" /> trending up
            </span>
          </div>
          <div className="mt-5 flex h-40 items-end gap-1.5">
            {m.dailyRevenue.map((d) => (
              <div key={d.day} className="group flex flex-1 flex-col items-center justify-end gap-1">
                <div className="text-[10px] font-medium text-subtle opacity-0 transition-opacity group-hover:opacity-100">
                  {formatINR(d.amount)}
                </div>
                <div
                  className="w-full rounded-t bg-brand-gradient transition-all"
                  style={{ height: `${(d.amount / maxRev) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-subtle">
            <span>{m.dailyRevenue[0]?.day}</span>
            <span>{m.dailyRevenue[m.dailyRevenue.length - 1]?.day}</span>
          </div>
        </Card>

        {/* Dispute queue preview */}
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Dispute queue</CardTitle>
            <Link href="/admin/disputes" className="text-xs font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {queue.length === 0 && <p className="text-sm text-muted">No open disputes.</p>}
            {queue.map((d) => {
              const meta = DISPUTE_STATUS_META[d.status];
              const escalated = isEscalated(d.deadlineISO);
              return (
                <Link
                  key={d.id}
                  href="/admin/disputes"
                  className="block rounded-lg border border-border p-3 transition-colors hover:bg-surface-muted"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted">{d.id}</span>
                    <div className="flex items-center gap-1.5">
                      {escalated && <Badge tone="danger">Escalated</Badge>}
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                  </div>
                  <div className="mt-1 line-clamp-1 text-sm font-medium">{d.jobTitle}</div>
                  <div className="mt-0.5 text-xs text-subtle">
                    {formatINR(d.amount)} · {d.studentName} vs {d.raisedByName}
                  </div>
                </Link>
              );
            })}
          </div>
          <Link
            href="/admin/disputes"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
          >
            Resolve disputes <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      </div>
    </>
  );
}

function MiniStat({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: "danger";
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span className={tone === "danger" ? "text-danger" : "text-subtle"}>{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-subtle">{sub}</div>}
    </Card>
  );
}
