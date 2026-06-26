import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, MessageSquare, Users, CheckCircle2, Bot } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderTimeline } from "@/components/feature/order-timeline";
import { AiReviewPanel } from "@/components/feature/ai-review-panel";
import { getOrder, getClientById } from "@/lib/data/queries";
import { ORDER_STATUS_META } from "@/lib/status";
import { formatINR } from "@/lib/utils";
import { computeSplit } from "@/lib/utils";
import { computeTeamSplit } from "@/lib/teams/split";
import { Input, Label } from "@/components/ui/input";
import { declareTeamSplit } from "@/app/actions/teams";

export const metadata = { title: "Order detail" };

export default async function StudentOrderDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ team?: string; pct?: string }>;
}) {
  const { id } = await params;
  const { team, pct } = await searchParams;
  const order = await getOrder(id);
  if (!order) notFound();

  const client = await getClientById(order.clientId);
  const meta = ORDER_STATUS_META[order.status];
  const split = computeSplit(order.amount);

  return (
    <>
      <PageHeader
        title={order.jobTitle}
        subtitle={`#${order.id} · ${client?.companyName ?? "Client"}`}
        action={<Badge tone={meta.tone}>{meta.label}</Badge>}
      />

      <OrderTimeline status={order.status} />

      {order.status === "active" && (
        <Card surface="flat" tint="sage" className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-[var(--color-sage-900)]">
            Before you start: a quick check-in message catches brief
            misunderstandings early. Most disputes trace back to silence.
          </span>
          <Button href={`/messages`} variant="sage" size="sm">
            Send a first check-in
          </Button>
        </Card>
      )}

      {(order.status === "submitted" || order.status === "in_ai_review") &&
        !order.aiReview && (
          <Card surface="flat" tint="sage" className="mt-6 flex items-center gap-3 text-sm">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-sage)] text-[var(--color-brown-900)]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-sage)] opacity-60" />
              <Bot className="relative h-4 w-4" />
            </span>
            <span className="text-[var(--color-sage-900)]" role="status" aria-live="polite">
              AI is reviewing your work against the brief. The result usually
              lands within a minute. Refresh to see the verdict.
            </span>
          </Card>
        )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardTitle>What you owe the client</CardTitle>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Deliver the work described in the brief by the deadline. The AI gate reviews every submission before the client sees it; you have a few revisions if anything misses.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1 text-muted">
                <Clock className="h-4 w-4" /> {order.deadlineDays}-day deadline
              </span>
              <span className="text-muted">Order value {formatINR(order.amount)}</span>
            </div>
          </Card>

          {order.aiReview && <AiReviewPanel review={order.aiReview} />}

          {(order.status === "active" || order.status === "revision_requested") && (
            <Card>
              <CardTitle>Ready to submit?</CardTitle>
              <p className="mt-2 text-sm text-muted">
                Upload your deliverables. The AI gate runs in the background and pushes the result back to you within a minute.
              </p>
              <Button href={`/student/orders/${order.id}/submit`} className="mt-4">
                Submit work
              </Button>
            </Card>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <CardTitle>Your payout</CardTitle>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Order value" value={formatINR(order.amount)} />
              <Row label="Platform fee (15%)" value={`- ${formatINR(split.commission)}`} muted />
              <div className="my-2 border-t border-border" />
              <Row label="You receive" value={formatINR(split.studentPayout)} strong />
            </div>
            <p className="mt-3 text-xs text-subtle">
              The client is charged when your work passes the gate. Your payout
              settles after the 72-hour dispute window, or sooner if the client
              releases it.
            </p>
          </Card>

          <Card>
            <CardTitle>About the client</CardTitle>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-trust-100 font-semibold text-trust-700">
                {client?.avatarInitials ?? "C"}
              </span>
              <div className="min-w-0">
                <div className="truncate font-medium">{client?.companyName ?? "Client"}</div>
                <div className="text-xs text-muted">{client?.city}</div>
              </div>
            </div>
            <Link
              href="/messages"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
            >
              <MessageSquare className="h-4 w-4" /> Message client
            </Link>
          </Card>
          <Card>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--color-sage-deep)]" />
              <CardTitle>Working as a team?</CardTitle>
            </div>
            {team === "saved" && pct ? (
              <div role="status" aria-live="polite" className="mt-3 flex items-start gap-2 text-sm text-[var(--color-sage-900)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sage-deep)]" />
                <span>
                  Split saved. Your teammate gets {pct}% of the payout:{" "}
                  {formatINR(
                    computeTeamSplit(order.amount, [
                      { studentId: "you", shareRatio: (100 - Number(pct)) / 100 },
                      { studentId: "mate", shareRatio: Number(pct) / 100 },
                    ]).perMember[1].amount
                  )}
                  . Payouts fan out automatically on release.
                </span>
              </div>
            ) : (
              <>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  Split the payout with a teammate. Each of you is paid your
                  share directly when escrow releases.
                </p>
                {team === "invalid" && (
                  <p className="mt-2 text-xs text-[var(--color-danger-deep)]">
                    Enter a teammate username and a share between 1 and 99.
                  </p>
                )}
                <form action={declareTeamSplit} className="mt-4 space-y-3">
                  <input type="hidden" name="orderId" value={order.id} />
                  <div className="space-y-1.5">
                    <Label htmlFor="teammate">Teammate username</Label>
                    <Input id="teammate" name="teammate" placeholder="diyawrites" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="teammatePct">Their share (%)</Label>
                    <Input id="teammatePct" name="teammatePct" type="number" min={1} max={99} placeholder="40" />
                  </div>
                  <Button type="submit" variant="secondary" size="sm" className="w-full">
                    Save team split
                  </Button>
                </form>
              </>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={muted ? "text-muted" : "text-muted"}>{label}</span>
      <span className={strong ? "font-semibold text-foreground" : muted ? "text-warning" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
