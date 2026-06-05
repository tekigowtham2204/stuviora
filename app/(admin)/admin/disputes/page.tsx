import Link from "next/link";
import { Scale, Paperclip, ArrowRight, Gavel } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Money } from "@/components/ui/money";
import { DisputeStatusPill } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { listDisputeQueue } from "@/lib/data/queries";
import { advanceDispute } from "@/app/actions/disputes";
import { resolveDispute } from "@/app/actions/admin";
import { isEscalated } from "@/lib/disputes/engine";
import { hoursLeft } from "@/lib/time";

export const metadata = { title: "Dispute queue" };

export default async function AdminDisputesPage() {
  const queue = await listDisputeQueue();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Dispute queue."
        subtitle="Most-escalated first. Resolution unwinds the held escrow automatically and writes the audit trail."
      />

      {queue.length === 0 ? (
        <EmptyState title="The queue is clear." />
      ) : (
        <div className="space-y-5">
          {queue.map((d) => {
            const left = hoursLeft(d.deadlineISO);
            const escalated = isEscalated(d.deadlineISO);
            const ready = d.status === "admin_review";
            return (
              <Card key={d.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-[var(--color-ink-faint)]" />
                      <span className="font-mono text-xs text-[var(--color-ink-muted)]">
                        {d.id}
                      </span>
                      <DisputeStatusPill status={d.status} />
                      {escalated && <Badge tone="danger">Escalated</Badge>}
                    </div>
                    <CardTitle className="mt-3 font-display text-lg font-medium">
                      {d.jobTitle}
                    </CardTitle>
                    <div className="mt-1.5 text-xs text-[var(--color-ink-muted)]">
                      Order #{d.orderId} · <Money value={d.amount} compact /> held ·{" "}
                      {d.studentName} vs {d.raisedByName} · raised {d.createdAgo}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    {left !== null && (
                      <span
                        className={
                          escalated
                            ? "font-medium text-[var(--color-danger-deep)]"
                            : "text-[var(--color-ink-muted)]"
                        }
                      >
                        {escalated ? "Past 48h" : `~${left}h left`}
                      </span>
                    )}
                    <Link
                      href={`/disputes/${d.id}`}
                      className="mt-1.5 flex items-center justify-end gap-1 font-medium text-[var(--color-ink)] hover:text-[var(--color-orange)]"
                    >
                      Full case <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                <p className="mt-4 rounded-2xl bg-[var(--color-surface-warm)] p-4 text-sm text-[var(--color-ink-muted)]">
                  {d.reason}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {d.evidence.map((e) => (
                    <span
                      key={e.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-warm)] px-3 py-1 text-xs text-[var(--color-ink-muted)]"
                    >
                      <span className="font-medium capitalize text-[var(--color-ink)]">
                        {e.byRole}
                      </span>
                      {e.fileName && (
                        <>
                          <Paperclip className="h-3 w-3" />
                          {e.fileName}
                        </>
                      )}
                    </span>
                  ))}
                </div>

                {!ready ? (
                  <form action={advanceDispute} className="mt-5">
                    <input type="hidden" name="disputeId" value={d.id} />
                    <Button type="submit" variant="outline">
                      Close evidence window and take for review
                    </Button>
                  </form>
                ) : (
                  <form
                    action={resolveDispute}
                    className="mt-5 space-y-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-warm)] p-5"
                  >
                    <input type="hidden" name="disputeId" value={d.id} />
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Gavel className="h-4 w-4 text-[var(--color-orange)]" />
                      Resolve this dispute
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Radio
                        name="resolution"
                        value="student_favour"
                        label="Release to student"
                        hint="Work accepted"
                        defaultChecked
                      />
                      <Radio
                        name="resolution"
                        value="client_favour"
                        label="Refund client"
                        hint="Commission reversed"
                      />
                      <Radio
                        name="resolution"
                        value="partial"
                        label="Partial split"
                        hint="Set student share"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                      <Input
                        name="reason"
                        required
                        placeholder="Reason (recorded in the audit trail)"
                      />
                      <div>
                        <Input
                          name="studentShare"
                          type="number"
                          min={0}
                          max={1}
                          step={0.05}
                          defaultValue={0.5}
                        />
                        <span className="mt-1 block text-[10px] text-[var(--color-ink-faint)]">
                          student share (partial only)
                        </span>
                      </div>
                    </div>
                    <Button type="submit" variant="primary">
                      Resolve and settle escrow
                    </Button>
                  </form>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function Radio({
  name,
  value,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  hint: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3 text-sm has-[:checked]:border-[var(--color-orange)] has-[:checked]:bg-[var(--color-orange-50)]">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="mt-0.5 accent-[var(--color-orange)]"
      />
      <span>
        <span className="block font-medium text-[var(--color-ink)]">{label}</span>
        <span className="block text-xs text-[var(--color-ink-muted)]">{hint}</span>
      </span>
    </label>
  );
}
