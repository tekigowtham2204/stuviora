import Link from "next/link";
import { PlusCircle, Bot } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Stat } from "@/components/ui/stat";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { currentClient } from "@/lib/auth/session";
import { listClientJobs, listClientOrders, getStudentById } from "@/lib/data/queries";
import { ORDER_STATUS_META } from "@/lib/status";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function ClientDashboard() {
  const me = currentClient();
  const jobs = await listClientJobs(me.id);
  const orders = await listClientOrders(me.id);

  const openJobs = jobs.filter((j) => j.status === "open");
  const inEscrow = orders.filter((o) =>
    ["active", "submitted", "in_ai_review", "awaiting_approval"].includes(o.status)
  );
  const escrowTotal = inEscrow.reduce((s, o) => s + o.amount, 0);
  const awaiting = orders.filter((o) => o.status === "awaiting_approval");

  const orderRows = await Promise.all(
    orders.map(async (o) => ({
      o,
      student: await getStudentById(o.studentId),
      meta: ORDER_STATUS_META[o.status],
    }))
  );

  return (
    <>
      <PageHeader
        title={`Welcome, ${me.fullName.split(" ")[0]}`}
        subtitle={me.companyName}
        action={
          <Button href="/client/post-job" variant="trust">
            <PlusCircle className="h-4 w-4" /> Post a job
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Open jobs" value={String(openJobs.length)} sub="receiving proposals" />
        <Stat label="Active orders" value={String(inEscrow.length)} sub="work in progress" />
        <Stat label="In escrow" value={formatINR(escrowTotal)} sub="protected funds" />
        <Stat label="Awaiting approval" value={String(awaiting.length)} sub="ready to review" />
      </div>

      {awaiting.length > 0 && (
        <Card className="mt-6 border-warning-bg bg-warning-bg/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Bot className="h-4 w-4 text-brand-600" />
              <span className="font-medium">{awaiting.length} delivery(ies) passed AI review and need your approval.</span>
            </div>
            <Button href={`/client/orders/${awaiting[0].id}`} size="sm">Review now</Button>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <CardTitle>Recent orders</CardTitle>
            <Link href="/client/orders" className="text-sm font-medium text-trust-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {orderRows.map(({ o, student, meta }) => (
              <Link key={o.id} href={`/client/orders/${o.id}`}>
                <Card className="flex items-center justify-between gap-4 transition-colors hover:border-trust-300">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{o.jobTitle}</div>
                    <div className="mt-0.5 text-xs text-muted">
                      #{o.id} · {student?.fullName ?? "Student"} · {formatINR(o.amount)}
                    </div>
                  </div>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <CardTitle>Your jobs</CardTitle>
            <Link href="/client/jobs" className="text-sm font-medium text-trust-600 hover:underline">All</Link>
          </div>
          <div className="space-y-3">
            {jobs.map((j) => (
              <Link key={j.id} href={`/client/jobs/${j.id}/proposals`} className="block">
                <Card className="transition-colors hover:border-trust-300">
                  <div className="line-clamp-1 text-sm font-medium">{j.title}</div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted">
                    <span>{formatINR(j.budgetMin)}–{formatINR(j.budgetMax)}</span>
                    <Badge tone="info">{j.proposalsCount} proposals</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
