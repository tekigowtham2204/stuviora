import Link from "next/link";
import { PlusCircle, Package } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { EmptyState } from "@/components/ui/empty-state";
import { listServicesByStudent } from "@/lib/data/queries";
import { currentStudent } from "@/lib/auth/session";

export const metadata = { title: "My services" };

export default async function StudentServicesPage() {
  const me = currentStudent();
  const services = await listServicesByStudent(me.id);

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="My services."
        subtitle="Packages clients can hire you for directly, without posting a job."
        action={
          <Button href="/student/services/new" variant="primary">
            <PlusCircle className="h-4 w-4" /> New service
          </Button>
        }
      />

      {services.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No services listed yet"
          body="List a service to let clients hire you instantly."
          action={
            <Button href="/student/services/new" variant="sage">
              List your first service
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {services.map((s) => (
            <Card key={s.id} className="flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="font-display text-lg font-medium">
                    {s.title}
                  </CardTitle>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                    {s.description}
                  </p>
                </div>
                <Badge tone={s.isActive ? "sage" : "neutral"}>
                  {s.isActive ? "Active" : "Paused"}
                </Badge>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--color-line)] pt-4">
                {s.packages.map((p) => (
                  <div key={p.tier}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                      {p.tier}
                    </div>
                    <div className="mt-1.5 font-display text-base font-medium tabular-nums text-[var(--color-ink)]">
                      <Money value={p.price} compact />
                    </div>
                    <div className="text-xs text-[var(--color-ink-faint)]">
                      {p.deliveryDays}d delivery
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href={`/student/services`}
                className="mt-auto pt-4 text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-sage-deep)]"
              >
                Edit details →
              </Link>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
