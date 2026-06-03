import Link from "next/link";
import { Scale, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listDisputesForUser } from "@/lib/data/queries";
import { DISPUTE_STATUS_META, DISPUTE_RESOLUTION_META } from "@/lib/status";
import { isEscalated } from "@/lib/disputes/engine";
import { formatINR } from "@/lib/utils";
import { hoursLeft } from "@/lib/time";

export const metadata = { title: "Disputes" };

export default async function DisputesPage() {
  const session = await getSession();
  const disputes = await listDisputesForUser(session?.id ?? "");

  return (
    <>
      <PageHeader
        title="Disputes"
        subtitle="When an order goes wrong, escrow is frozen and both sides get a fair hearing."
      />

      {disputes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-success">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <CardTitle className="mt-4">No disputes. That&apos;s the goal.</CardTitle>
          <CardDescription className="max-w-sm">
            Every order is protected by escrow and the AI quality gate. If something goes
            wrong, you can open a dispute from the order page.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => {
            const meta = DISPUTE_STATUS_META[d.status];
            const left = hoursLeft(d.deadlineISO);
            const escalated = d.status !== "resolved" && isEscalated(d.deadlineISO);
            return (
              <Link key={d.id} href={`/disputes/${d.id}`} className="block">
                <Card className="transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-subtle" />
                        <span className="font-mono text-xs text-muted">{d.id}</span>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                        {d.status === "resolved" && (
                          <Badge tone={DISPUTE_RESOLUTION_META[d.resolution].tone}>
                            {DISPUTE_RESOLUTION_META[d.resolution].label}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="mt-2">{d.jobTitle}</CardTitle>
                      <p className="mt-1 line-clamp-1 text-sm text-muted">{d.reason}</p>
                      <div className="mt-2 text-xs text-subtle">
                        Order #{d.orderId} · {formatINR(d.amount)} in escrow · raised by{" "}
                        {d.raisedByName} · {d.createdAgo}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {d.status !== "resolved" && left !== null && (
                        <span
                          className={
                            escalated
                              ? "flex items-center gap-1 text-xs font-medium text-danger"
                              : "flex items-center gap-1 text-xs text-muted"
                          }
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {escalated ? "Escalated" : `~${left}h left`}
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 text-subtle" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
