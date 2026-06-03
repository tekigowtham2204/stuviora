import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, MessageSquare } from "lucide-react";
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

export const metadata = { title: "Order detail" };

export default async function StudentOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
              Released to your wallet on client approval or 72-hour auto-release.
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
