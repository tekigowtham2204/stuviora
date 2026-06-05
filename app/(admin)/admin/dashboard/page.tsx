import Link from "next/link";
import {
  Scale,
  ArrowRight,
  TrendingUp,
  Wallet,
  Users,
  ShoppingBag,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/ui/money";
import { DisputeStatusPill } from "@/components/ui/status-pill";
import { getPlatformMetrics, listDisputeQueue } from "@/lib/data/queries";
import { isEscalated } from "@/lib/disputes/engine";

export const metadata = { title: "Admin overview" };

export default async function AdminDashboard() {
  const m = await getPlatformMetrics();
  const queue = await listDisputeQueue();
  const maxRev = Math.max(...m.dailyRevenue.map((d) => d.amount));

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Platform overview."
        subtitle="Live GMV, revenue, escrow, and the dispute queue. Updated in real time once Supabase is wired."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="GMV"
          value={`Rs.${(m.gmv / 100000).toFixed(1)}L`}
          sub="lifetime gross merchandise"
          accent="ink"
        />
        <Stat
          icon={<Wallet className="h-3.5 w-3.5" />}
          label="Net revenue"
          value={`Rs.${(m.revenueNet / 1000).toFixed(0)}k`}
          sub="commission after GST"
          accent="sage"
        />
        <Stat
          icon={<Receipt className="h-3.5 w-3.5" />}
          label="GST collected"
          value={`Rs.${(m.gstCollected / 1000).toFixed(1)}k`}
          sub="18% on platform fees"
          accent="yellow"
        />
        <Stat
          icon={<Receipt className="h-3.5 w-3.5" />}
          label="TDS withheld"
          value={`Rs.${(m.tdsWithheld / 1000).toFixed(1)}k`}
          sub="Section 194H"
          accent="orange"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat
          icon={<ShoppingBag className="h-4 w-4" />}
          label="Active orders"
          value={String(m.activeOrders)}
        />
        <MiniStat
          icon={<Scale className="h-4 w-4" />}
          label="Open disputes"
          value={String(m.openDisputes)}
          tone="danger"
        />
        <MiniStat
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Escrow held"
          value={`Rs.${(m.escrowHeld / 1000).toFixed(1)}k`}
        />
        <MiniStat
          icon={<Users className="h-4 w-4" />}
          label="Users"
          value={`${m.students + m.clients}`}
          sub={`${m.students} students · ${m.clients} clients`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Daily revenue */}
        <Card surface="raised">
          <div className="flex items-center justify-between">
            <CardTitle>Daily revenue: last 14 days</CardTitle>
            <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-sage-900)]">
              <TrendingUp className="h-3.5 w-3.5" /> trending up
            </span>
          </div>
          <div className="mt-6 flex h-48 items-end gap-2">
            {m.dailyRevenue.map((d) => (
              <div
                key={d.day}
                className="group flex flex-1 flex-col items-center justify-end gap-1"
              >
                <div className="text-[10px] font-medium text-[var(--color-ink-faint)] opacity-0 transition-opacity group-hover:opacity-100">
                  <Money value={d.amount} compact />
                </div>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-[var(--color-yellow-deep)] to-[var(--color-yellow)] transition-all hover:from-[var(--color-orange)] hover:to-[var(--color-orange)]"
                  style={{ height: `${(d.amount / maxRev) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-[var(--color-ink-faint)]">
            <span>{m.dailyRevenue[0]?.day}</span>
            <span>{m.dailyRevenue[m.dailyRevenue.length - 1]?.day}</span>
          </div>
        </Card>

        {/* Dispute queue preview */}
        <Card surface="raised">
          <div className="flex items-center justify-between">
            <CardTitle>Dispute queue</CardTitle>
            <Link
              href="/admin/disputes"
              className="text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-orange)]"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {queue.length === 0 ? (
              <p className="text-sm text-[var(--color-ink-muted)]">No open disputes.</p>
            ) : (
              queue.map((d) => {
                const escalated = isEscalated(d.deadlineISO);
                return (
                  <Link
                    key={d.id}
                    href="/admin/disputes"
                    className="block rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-warm)] p-4 transition-colors hover:border-[var(--color-orange)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-[var(--color-ink-muted)]">
                        {d.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {escalated && <Badge tone="danger">Escalated</Badge>}
                        <DisputeStatusPill status={d.status} />
                      </div>
                    </div>
                    <div className="mt-1 line-clamp-1 text-sm font-medium text-[var(--color-ink)]">
                      {d.jobTitle}
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-ink-faint)]">
                      <Money value={d.amount} compact /> · {d.studentName} vs{" "}
                      {d.raisedByName}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
          <Link
            href="/admin/disputes"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-orange)]"
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
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
        <span
          className={
            tone === "danger"
              ? "text-[var(--color-danger-deep)]"
              : "text-[var(--color-ink-faint)]"
          }
        >
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-medium tabular-nums text-[var(--color-ink)]">
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-[var(--color-ink-faint)]">{sub}</div>}
    </Card>
  );
}
