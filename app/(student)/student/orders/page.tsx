import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listStudentOrders } from "@/lib/data/queries";
import { currentStudent } from "@/lib/auth/session";
import { ORDER_STATUS_META } from "@/lib/status";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "Orders" };

export default async function StudentOrdersPage() {
  const me = currentStudent();
  const orders = await listStudentOrders(me.id);

  const active = orders.filter((o) => !["completed", "cancelled", "refunded"].includes(o.status));
  const past = orders.filter((o) => ["completed", "cancelled", "refunded"].includes(o.status));

  return (
    <>
      <PageHeader title="Orders" subtitle="Work you're delivering, and what you've shipped." />

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Active</h2>
      <div className="space-y-3">
        {active.length === 0 && (
          <Card className="text-sm text-muted">No active orders.</Card>
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

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Past</h2>
      <div className="space-y-3">
        {past.length === 0 && (
          <Card className="text-sm text-muted">No completed orders yet.</Card>
        )}
        {past.map((o) => {
          const meta = ORDER_STATUS_META[o.status];
          return (
            <Link key={o.id} href={`/student/orders/${o.id}`}>
              <Card className="flex items-center justify-between gap-4 transition-colors hover:border-brand-300">
                <div className="min-w-0">
                  <div className="truncate font-medium">{o.jobTitle}</div>
                  <div className="mt-0.5 text-xs text-muted">
                    #{o.id} · {formatINR(o.amount)} · {o.createdAgo}
                  </div>
                </div>
                <Badge tone={meta.tone}>{meta.label}</Badge>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
