import Link from "next/link";
import { Scale, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/ui/money";
import { DisputeStatusPill } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { getSession } from "@/lib/auth/session";
import { listDisputesForUser } from "@/lib/data/queries";
import { DISPUTE_RESOLUTION_META } from "@/lib/status";
import { isEscalated } from "@/lib/disputes/engine";
import { hoursLeft } from "@/lib/time";

export const metadata = { title: "Disputes" };

export default async function DisputesPage() {
  const session = await getSession();
  const disputes = await listDisputesForUser(session?.id ?? "");

  return (
    <>
      <PageHeader
        eyebrow="Dispute resolution"
        title="Disputes."
        subtitle="When an order goes wrong, escrow is frozen and both sides get a fair hearing."
      />

      {disputes.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="h-6 w-6" />}
          title="No disputes. That is the goal."
          body="Every order is protected by escrow and the AI quality gate. If something goes wrong, you can open a dispute from the order page."
        />
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => {
            const left = hoursLeft(d.deadlineISO);
            const escalated = d.status !== "resolved" && isEscalated(d.deadlineISO);
            return (
              <Link key={d.id} href={`/disputes/${d.id}`} className="block">
                <Card className="transition-all hover:border-[var(--color-danger)] hover:shadow-[var(--shadow-card-lg)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-[var(--color-ink-faint)]" />
                        <span className="font-mono text-xs text-[var(--color-ink-muted)]">
                          {d.id}
                        </span>
                        <DisputeStatusPill status={d.status} />
                        {d.status === "resolved" && (
                          <Badge tone={DISPUTE_RESOLUTION_META[d.resolution].tone}>
                            {DISPUTE_RESOLUTION_META[d.resolution].label}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="mt-3 font-display text-lg font-medium">
                        {d.jobTitle}
                      </CardTitle>
                      <p className="mt-1.5 line-clamp-1 text-sm text-[var(--color-ink-muted)]">
                        {d.reason}
                      </p>
                      <div className="mt-2 text-xs text-[var(--color-ink-faint)]">
                        Order #{d.orderId} · <Money value={d.amount} compact /> in escrow ·
                        raised by {d.raisedByName} · {d.createdAgo}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {d.status !== "resolved" && left !== null && (
                        <span
                          className={
                            escalated
                              ? "flex items-center gap-1 text-xs font-medium text-[var(--color-danger-deep)]"
                              : "flex items-center gap-1 text-xs text-[var(--color-ink-muted)]"
                          }
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {escalated ? "Escalated" : `~${left}h left`}
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 text-[var(--color-ink-faint)]" />
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
