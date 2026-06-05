import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { OrderStatusPill } from "@/components/ui/status-pill";
import { Money } from "@/components/ui/money";
import { EmptyState } from "@/components/ui/empty-state";
import { listClientOrders, getStudentById } from "@/lib/data/queries";
import { currentClient } from "@/lib/auth/session";

export const metadata = { title: "Orders" };

export default async function ClientOrdersPage() {
  const me = currentClient();
  const orders = await listClientOrders(me.id);

  const rows = await Promise.all(
    orders.map(async (o) => ({
      o,
      student: await getStudentById(o.studentId),
    }))
  );

  const active = rows.filter(
    ({ o }) => !["completed", "cancelled", "refunded"].includes(o.status)
  );
  const past = rows.filter(({ o }) =>
    ["completed", "cancelled", "refunded"].includes(o.status)
  );

  return (
    <>
      <PageHeader
        eyebrow="Hires"
        title="Orders."
        subtitle="Active hires and past projects."
      />

      <Section title="Active">
        {active.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="No active orders"
            body="Hire a student from a job's proposals to start one."
          />
        ) : (
          <div className="space-y-3">
            {active.map(({ o, student }) => (
              <Link key={o.id} href={`/client/orders/${o.id}`}>
                <Card className="flex items-center justify-between gap-4 transition-colors hover:border-[var(--color-orange)]">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-[var(--color-ink)]">
                      {o.jobTitle}
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-ink-muted)]">
                      #{o.id} · {student?.fullName} · <Money value={o.amount} />
                    </div>
                  </div>
                  <OrderStatusPill status={o.status} />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="Past" className="mt-10">
        {past.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            No completed orders yet.
          </p>
        ) : (
          <div className="space-y-3">
            {past.map(({ o, student }) => (
              <Link key={o.id} href={`/client/orders/${o.id}`}>
                <Card className="flex items-center justify-between gap-4 transition-colors hover:border-[var(--color-orange)]">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-[var(--color-ink)]">
                      {o.jobTitle}
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-ink-muted)]">
                      #{o.id} · {student?.fullName} · <Money value={o.amount} /> ·{" "}
                      {o.createdAgo}
                    </div>
                  </div>
                  <OrderStatusPill status={o.status} />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

function Section({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
        {title}
      </h2>
      {children}
    </div>
  );
}
