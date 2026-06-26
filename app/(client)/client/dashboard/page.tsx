import Link from "next/link";
import {
  PlusCircle,
  Bot,
  Briefcase,
  Wallet,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Stat } from "@/components/ui/stat";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusPill } from "@/components/ui/status-pill";
import { Money } from "@/components/ui/money";
import { EmptyState } from "@/components/ui/empty-state";
import { currentClient } from "@/lib/auth/session";
import { listClientJobs, listClientOrders, getStudentById } from "@/lib/data/queries";

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
    orders.map(async (o) => ({ o, student: await getStudentById(o.studentId) }))
  );

  return (
    <>
      <PageHeader
        eyebrow="Client dashboard"
        title={`Welcome, ${me.fullName.split(" ")[0]}.`}
        subtitle={`${me.companyName}. Here is what is happening with your team's work.`}
        action={
          <Button href="/client/post-job" variant="primary">
            <PlusCircle className="h-4 w-4" /> Post a job
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={<Briefcase className="h-3.5 w-3.5" />}
          label="Open jobs"
          value={String(openJobs.length)}
          sub="receiving proposals"
          accent="orange"
        />
        <Stat
          icon={<ShoppingBag className="h-3.5 w-3.5" />}
          label="Active orders"
          value={String(inEscrow.length)}
          sub="in progress"
          accent="ink"
        />
        <Stat
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          label="Authorized"
          value={`Rs.${escrowTotal.toLocaleString("en-IN")}`}
          sub="held, charged on delivery"
          accent="sage"
        />
        <Stat
          icon={<Wallet className="h-3.5 w-3.5" />}
          label="Awaiting approval"
          value={String(awaiting.length)}
          sub="ready to review"
          accent="yellow"
        />
      </div>

      {awaiting.length > 0 && (
        <Card surface="raised" tint="warm" className="mt-6 border-[var(--color-orange-200)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-orange)] text-[var(--color-brown-900)]">
                <Bot className="h-5 w-5" />
              </span>
              <span className="font-medium text-[var(--color-ink)]">
                {awaiting.length} delivery
                {awaiting.length === 1 ? "" : "ies"} passed AI review and need your
                approval.
              </span>
            </div>
            <Button href={`/client/orders/${awaiting[0].id}`} variant="primary" size="sm">
              Review now
            </Button>
          </div>
        </Card>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-medium text-[var(--color-ink)]">
              Recent orders
            </h2>
            <Link
              href="/client/orders"
              className="text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-orange)]"
            >
              View all →
            </Link>
          </div>
          {orderRows.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="h-6 w-6" />}
              title="No orders yet"
              body="When a student is hired, the order will show up here."
            />
          ) : (
            <div className="space-y-3">
              {orderRows.map(({ o, student }) => (
                <Link key={o.id} href={`/client/orders/${o.id}`}>
                  <Card className="flex items-center justify-between gap-4 transition-colors hover:border-[var(--color-orange)]">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-[var(--color-ink)]">
                        {o.jobTitle}
                      </div>
                      <div className="mt-1 text-xs text-[var(--color-ink-muted)]">
                        #{o.id} · {student?.fullName ?? "Student"} ·{" "}
                        <Money value={o.amount} />
                      </div>
                    </div>
                    <OrderStatusPill status={o.status} />
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-medium text-[var(--color-ink)]">
              Your jobs
            </h2>
            <Link
              href="/client/jobs"
              className="text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-orange)]"
            >
              All →
            </Link>
          </div>
          {jobs.length === 0 ? (
            <EmptyState
              icon={<PlusCircle className="h-6 w-6" />}
              title="No jobs posted yet"
              body="Post a brief to get matched with top students."
              action={
                <Button href="/client/post-job" variant="primary" size="sm">
                  Post a job
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {jobs.map((j) => (
                <Link key={j.id} href={`/client/jobs/${j.id}/proposals`} className="block">
                  <Card className="transition-colors hover:border-[var(--color-orange)]">
                    <div className="line-clamp-1 text-sm font-medium text-[var(--color-ink)]">
                      {j.title}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <Money value={j.budgetMin} to={j.budgetMax} compact />
                      <Badge tone="sage">
                        <Sparkles className="h-3 w-3" />
                        {j.proposalsCount}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
