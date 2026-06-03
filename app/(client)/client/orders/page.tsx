import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listClientOrders, getStudentById } from "@/lib/data/queries";
import { currentClient } from "@/lib/auth/session";
import { ORDER_STATUS_META } from "@/lib/status";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "Orders" };

export default async function ClientOrdersPage() {
  const me = currentClient();
  const orders = await listClientOrders(me.id);

  const rows = await Promise.all(
    orders.map(async (o) => ({
      o,
      student: await getStudentById(o.studentId),
      meta: ORDER_STATUS_META[o.status],
    }))
  );

  const active = rows.filter(({ o }) => !["completed", "cancelled", "refunded"].includes(o.status));
  const past = rows.filter(({ o }) => ["completed", "cancelled", "refunded"].includes(o.status));

  return (
    <>
      <PageHeader title="Orders" subtitle="Active hires and past projects." />

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Active</h2>
      <div className="space-y-3">
        {active.length === 0 && (
          <Card className="text-sm text-muted">No active orders. Hire a student to start one.</Card>
        )}
        {active.map(({ o, student, meta }) => (
          <Link key={o.id} href={`/client/orders/${o.id}`}>
            <Card className="flex items-center justify-between gap-4 transition-colors hover:border-trust-300">
              <div className="min-w-0">
                <div className="truncate font-medium">{o.jobTitle}</div>
                <div className="mt-0.5 text-xs text-muted">
                  #{o.id} · {student?.fullName} · {formatINR(o.amount)}
                </div>
              </div>
              <Badge tone={meta.tone}>{meta.label}</Badge>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Past</h2>
      <div className="space-y-3">
        {past.length === 0 && (
          <Card className="text-sm text-muted">No completed orders yet.</Card>
        )}
        {past.map(({ o, student, meta }) => (
          <Link key={o.id} href={`/client/orders/${o.id}`}>
            <Card className="flex items-center justify-between gap-4 transition-colors hover:border-trust-300">
              <div className="min-w-0">
                <div className="truncate font-medium">{o.jobTitle}</div>
                <div className="mt-0.5 text-xs text-muted">
                  #{o.id} · {student?.fullName} · {formatINR(o.amount)} · {o.createdAgo}
                </div>
              </div>
              <Badge tone={meta.tone}>{meta.label}</Badge>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
