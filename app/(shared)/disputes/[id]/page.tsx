import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, FileText, Paperclip, ShieldCheck, UserCog } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DisputeTimeline } from "@/components/feature/dispute-timeline";
import { getDispute } from "@/lib/data/queries";
import { submitEvidence, appealDispute } from "@/app/actions/disputes";
import { appealedDisputeIds } from "@/lib/demo/state";
import { DISPUTE_STATUS_META, DISPUTE_RESOLUTION_META } from "@/lib/status";
import { isEscalated, ESCALATION_HOURS } from "@/lib/disputes/engine";
import { formatINR, cn } from "@/lib/utils";
import { hoursLeft } from "@/lib/time";

export const metadata = { title: "Dispute" };

const ROLE_TONE = {
  client: "info",
  student: "trust",
  admin: "brand",
} as const;

export default async function DisputeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dispute = await getDispute(id);
  if (!dispute) notFound();
  const appealed = appealedDisputeIds.has(id);

  const meta = DISPUTE_STATUS_META[dispute.status];
  const left = hoursLeft(dispute.deadlineISO);
  const escalated = dispute.status !== "resolved" && isEscalated(dispute.deadlineISO);
  const canSubmitEvidence =
    dispute.status === "open" || dispute.status === "evidence_collection";

  return (
    <>
      <PageHeader
        title={dispute.jobTitle}
        subtitle={`${dispute.id} · Order #${dispute.orderId}`}
        action={<Badge tone={meta.tone}>{meta.label}</Badge>}
      />

      {appealed && (
        <Card role="status" aria-live="polite" surface="flat" tint="sage" className="mb-6 text-sm text-[var(--color-sage-900)]">
          Appeal filed. The case is back with our review team; both sides
          will hear from us within 48 hours.
        </Card>
      )}

      {dispute.status === "resolved" && !appealed && (
        <Card surface="flat" tint="warm" className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-[var(--color-ink-muted)]">
            Disagree with this outcome? You can appeal once within 7 days of
            resolution.
          </span>
          <form action={appealDispute}>
            <input type="hidden" name="disputeId" value={dispute.id} />
            <Button type="submit" variant="secondary" size="sm">
              Appeal this decision
            </Button>
          </form>
        </Card>
      )}

      <Card className="mb-6">
        <DisputeTimeline status={dispute.status} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardTitle>Why this dispute was raised</CardTitle>
            <p className="mt-1 text-xs text-subtle">
              Raised by {dispute.raisedByName} · {dispute.createdAgo}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{dispute.reason}</p>
          </Card>

          <div>
            <CardTitle>Evidence</CardTitle>
            <div className="mt-3 space-y-3">
              {dispute.evidence.map((e) => (
                <Card key={e.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{e.byName}</span>
                    <Badge tone={ROLE_TONE[e.byRole]}>{e.byRole}</Badge>
                    <span className="ml-auto text-xs text-subtle">{e.ago}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{e.note}</p>
                  {e.fileName && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-surface-muted px-2.5 py-1 text-xs text-muted">
                      <Paperclip className="h-3.5 w-3.5" />
                      {e.fileName}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {canSubmitEvidence && (
            <Card>
              <CardTitle>Add your evidence</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Share files, screenshots, or context. Both sides see everything. An admin
                weighs it once the evidence window closes.
              </p>
              <form action={submitEvidence} className="mt-4 space-y-3">
                <input type="hidden" name="disputeId" value={dispute.id} />
                <textarea
                  name="note"
                  rows={3}
                  required
                  placeholder="Explain your side and reference any attachments."
                  className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted hover:text-foreground">
                    <Paperclip className="h-4 w-4" />
                    Attach a file
                    <input type="file" name="file" className="hidden" />
                  </label>
                  <Button type="submit" variant="primary">
                    <FileText className="h-4 w-4" /> Submit evidence
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {dispute.status === "resolved" && dispute.resolvedNote && (
            <Card className="border-success/30 bg-success-bg/40">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-success" />
                <CardTitle>Resolved · {DISPUTE_RESOLUTION_META[dispute.resolution].label}</CardTitle>
              </div>
              <p className="mt-2 text-sm text-muted">{dispute.resolvedNote}</p>
            </Card>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <CardTitle>Status</CardTitle>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Stage" value={meta.label} />
              <Row label="Resolution" value={DISPUTE_RESOLUTION_META[dispute.resolution].label} />
              <Row label="In escrow (held)" value={formatINR(dispute.amount)} strong />
            </div>
            {dispute.status !== "resolved" && left !== null && (
              <p
                className={cn(
                  "mt-4 flex items-center gap-1.5 rounded-lg p-3 text-xs",
                  escalated ? "bg-danger-bg text-danger" : "bg-warning-bg text-warning"
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                {escalated
                  ? "Past the 48h window — escalated to an admin."
                  : `~${left}h left in this ${ESCALATION_HOURS}h stage.`}
              </p>
            )}
          </Card>

          <Card>
            <CardTitle>Parties</CardTitle>
            <div className="mt-3 space-y-3 text-sm">
              <Party role="Client" name={dispute.clientName} />
              <Party role="Student" name={dispute.studentName} />
            </div>
            <Link
              href="/messages"
              className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
            >
              Open the order thread
            </Link>
          </Card>

          <Card className="bg-surface-muted">
            <div className="flex items-center gap-2 text-sm font-medium">
              <UserCog className="h-4 w-4 text-subtle" /> How resolution works
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Both sides upload evidence within 48 hours. If unresolved, it escalates to a
              Stuviora admin who decides: full refund, full release, or a partial split. The
              held escrow unwinds accordingly.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={strong ? "font-semibold text-foreground" : "font-medium"}>{value}</span>
    </div>
  );
}

function Party({ role, name }: { role: string; name: string }) {
  return (
    <div>
      <div className="text-xs text-subtle">{role}</div>
      <div className="font-medium">{name}</div>
    </div>
  );
}
