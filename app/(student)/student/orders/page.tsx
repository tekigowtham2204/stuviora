import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { OrderStatusPill } from "@/components/ui/status-pill";
import { Money } from "@/components/ui/money";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingBag } from "lucide-react";
import { listStudentOrders } from "@/lib/data/queries";
import { currentStudent } from "@/lib/auth/session";

export const metadata = { title: "Orders" };

export default async function StudentOrdersPage() {
  const me = currentStudent();
  const orders = await listStudentOrders(me.id);

  const active = orders.filter(
    (o) => !["completed", "cancelled", "refunded"].includes(o.status)
  );
  const past = orders.filter((o) =>
    ["completed", "cancelled", "refunded"].includes(o.status)
  );

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title="Orders."
        subtitle="What you are delivering, and what you have shipped."
      />

      <Section title="Active">
        {active.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="No active orders"
            body="Browse matched jobs to land your next one."
          />
        ) : (
          <div className="space-y-3">
            {active.map((o) => (
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
            {past.map((o) => (
              <Link key={o.id} href={`/student/orders/${o.id}`}>
                <Card className="flex items-center justify-between gap-4 transition-colors hover:border-[var(--color-sage)]">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-[var(--color-ink)]">
                      {o.jobTitle}
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-ink-muted)]">
                      #{o.id} · <Money value={o.amount} /> · {o.createdAgo}
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
