import Link from "next/link";
import { Scale, Paperclip, ArrowRight, Gavel } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listDisputeQueue } from "@/lib/data/queries";
import { advanceDispute } from "@/app/actions/disputes";
import { resolveDispute } from "@/app/actions/admin";
import { DISPUTE_STATUS_META } from "@/lib/status";
import { isEscalated } from "@/lib/disputes/engine";
import { formatINR } from "@/lib/utils";
import { hoursLeft } from "@/lib/time";

export const metadata = { title: "Dispute queue" };

export default async function AdminDisputesPage() {
  const queue = await listDisputeQueue();

  return (
    <>
      <PageHeader
        title="Dispute queue"
        subtitle="Most-escalated first. Resolution unwinds the held escrow automatically."
      />

      {queue.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted">The queue is clear.</Card>
      ) : (
        <div className="space-y-4">
          {queue.map((d) => {
            const meta = DISPUTE_STATUS_META[d.status];
            const left = hoursLeft(d.deadlineISO);
            const escalated = isEscalated(d.deadlineISO);
            const ready = d.status === "admin_review";
            return (
              <Card key={d.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-subtle" />
                      <span className="font-mono text-xs text-muted">{d.id}</span>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      {escalated && <Badge tone="danger">Escalated</Badge>}
                    </div>
                    <CardTitle className="mt-2">{d.jobTitle}</CardTitle>
                    <div className="mt-1 text-xs text-subtle">
                      Order #{d.orderId} · {formatINR(d.amount)} held · {d.studentName} vs{" "}
                      {d.raisedByName} · raised {d.createdAgo}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    {left !== null && (
                      <span className={escalated ? "font-medium text-danger" : "text-muted"}>
                        {escalated ? "Past 48h" : `~${left}h left`}
                      </span>
                    )}
                    <Link
                      href={`/disputes/${d.id}`}
                      className="mt-1 flex items-center justify-end gap-1 font-medium text-brand-600 hover:underline"
                    >
                      Full case <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                <p className="mt-3 rounded-lg bg-surface-muted p-3 text-sm text-muted">{d.reason}</p>

                {/* Evidence summary */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {d.evidence.map((e) => (
                    <span
                      key={e.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs text-muted"
                    >
                      <span className="font-medium capitalize text-foreground">{e.byRole}</span>
                      {e.fileName && (
                        <>
                          <Paperclip className="h-3 w-3" />
                          {e.fileName}
                        </>
                      )}
                    </span>
                  ))}
                </div>

                {/* Action: advance, or resolve */}
                {!ready ? (
                  <form action={advanceDispute} className="mt-4">
                    <input type="hidden" name="disputeId" value={d.id} />
                    <Button type="submit" variant="outline">
                      Close evidence window &amp; take for review
                    </Button>
                  </form>
                ) : (
                  <form action={resolveDispute} className="mt-4 space-y-3 rounded-lg border border-border p-4">
                    <input type="hidden" name="disputeId" value={d.id} />
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Gavel className="h-4 w-4 text-brand-600" /> Resolve this dispute
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Radio name="resolution" value="student_favour" label="Release to student" hint="Work accepted" defaultChecked />
                      <Radio name="resolution" value="client_favour" label="Refund client" hint="Commission reversed" />
                      <Radio name="resolution" value="partial" label="Partial split" hint="Set student share" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                      <input
                        name="reason"
                        required
                        placeholder="Reason (recorded in the audit trail)"
                        className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                      />
                      <div>
                        <input
                          name="studentShare"
                          type="number"
                          min={0}
                          max={1}
                          step={0.05}
                          defaultValue={0.5}
                          className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                        />
                        <span className="text-[10px] text-subtle">student share (partial only)</span>
                      </div>
                    </div>
                    <Button type="submit" variant="primary">
                      Resolve &amp; settle escrow
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
    <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-2.5 text-sm has-[:checked]:border-brand-400 has-[:checked]:bg-brand-100">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="mt-0.5 accent-brand-600" />
      <span>
        <span className="block font-medium">{label}</span>
        <span className="block text-xs text-subtle">{hint}</span>
      </span>
    </label>
  );
}
