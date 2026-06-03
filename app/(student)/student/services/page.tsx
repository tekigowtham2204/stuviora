import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listServicesByStudent } from "@/lib/data/queries";
import { currentStudent } from "@/lib/auth/session";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "My services" };

export default async function StudentServicesPage() {
  const me = currentStudent();
  const services = await listServicesByStudent(me.id);

  return (
    <>
      <PageHeader
        title="My services"
        subtitle="Packages clients can hire you for directly, without posting a job."
        action={
          <Button href="/student/services/new">
            <PlusCircle className="h-4 w-4" /> New service
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {services.length === 0 && (
          <Card className="md:col-span-2 text-sm text-muted">
            You haven&apos;t listed any services yet. List one to let clients hire you instantly.
          </Card>
        )}
        {services.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{s.title}</CardTitle>
                <p className="mt-1 text-sm text-muted">{s.description}</p>
              </div>
              <Badge tone={s.isActive ? "success" : "neutral"}>
                {s.isActive ? "Active" : "Paused"}
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
              {s.packages.map((p) => (
                <div key={p.tier}>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted">
                    {p.tier}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold">{formatINR(p.price)}</div>
                  <div className="text-xs text-subtle">{p.deliveryDays}d delivery</div>
                </div>
              ))}
            </div>
            <Link
              href={`/student/services`}
              className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
            >
              Edit details
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
