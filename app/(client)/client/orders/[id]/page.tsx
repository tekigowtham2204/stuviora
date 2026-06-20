import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, MessageSquare, Check, RotateCcw, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderTimeline } from "@/components/feature/order-timeline";
import { AiReviewPanel } from "@/components/feature/ai-review-panel";
import { getOrder, getStudentById } from "@/lib/data/queries";
import { approveOrder, requestRevision } from "@/app/actions/orders";
import { openDispute } from "@/app/actions/disputes";
import { setOrderShareable } from "@/app/actions/export";
import { shareableOrderIds } from "@/lib/demo/state";
import { ORDER_STATUS_META } from "@/lib/status";
import { formatINR, computeSplit } from "@/lib/utils";
import { computeOrderTax } from "@/lib/tax/engine";
import { ESCROW_AUTO_RELEASE_HOURS } from "@/lib/constants";

export const metadata = { title: "Review delivery" };

export default async function ClientOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const student = await getStudentById(order.studentId);
  const meta = ORDER_STATUS_META[order.status];
  const split = computeSplit(order.amount);
  const tax = computeOrderTax(order.amount);
  const showInvoice = order.status === "completed";

  // Parse 72h countdown from approvedAgo (demo: "31h ago" -> 41 remaining)
  const elapsed = order.approvedAgo ? parseInt(order.approvedAgo) || 0 : 0;
  const hoursRemaining = Math.max(0, ESCROW_AUTO_RELEASE_HOURS - elapsed);

  const canAct = order.status === "awaiting_approval";

  return (
    <>
      <PageHeader
        title={order.jobTitle}
        subtitle={`#${order.id} · ${student?.fullName ?? "Student"}`}
        action={<Badge tone={meta.tone}>{meta.label}</Badge>}
      />

      <OrderTimeline status={order.status} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {order.aiReview && <AiReviewPanel review={order.aiReview} />}

          {canAct && (
            <Card>
              <CardTitle>Review the delivery</CardTitle>
              <p className="mt-2 text-sm text-muted">
                Take a look at the files. If everything checks out, approve to release the payout. If something is off, request a revision or open a dispute.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <form action={approveOrder}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <Button type="submit" variant="trust" className="w-full">
                    <Check className="h-4 w-4" /> Approve & pay
                  </Button>
                </form>
                <form action={requestRevision}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <Button type="submit" variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4" /> Request revision
                  </Button>
                </form>
                <form action={openDispute}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <Button type="submit" variant="ghost" className="w-full">
                    <AlertTriangle className="h-4 w-4" /> Open dispute
                  </Button>
                </form>
              </div>
              {hoursRemaining > 0 && (
                <p className="mt-4 rounded-lg bg-warning-bg p-3 text-xs text-warning">
                  <Clock className="mr-1 inline h-3.5 w-3.5" />
                  Auto-releases in ~{hoursRemaining}h if you don&apos;t respond.
                </p>
              )}
              <form
                action={setOrderShareable}
                className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--color-line)] px-3 py-2.5"
              >
                <input type="hidden" name="orderId" value={order.id} />
                <label htmlFor="shareable" className="text-xs text-[var(--color-ink-muted)]">
                  Let {student?.fullName ?? "the student"} feature this work in
                  their public portfolio. Off by default; you keep the work
                  private otherwise.
                </label>
                <span className="flex shrink-0 items-center gap-2">
                  <input
                    id="shareable"
                    type="checkbox"
                    name="shareable"
                    defaultChecked={shareableOrderIds.has(order.id)}
                    className="h-4 w-4 accent-[var(--color-sage-deep)]"
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Save
                  </Button>
                </span>
              </form>
            </Card>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <CardTitle>Payment</CardTitle>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Order value" value={formatINR(order.amount)} />
              <Row label="Student payout (85%)" value={formatINR(split.studentPayout)} muted />
              <Row label="Platform fee (15%)" value={formatINR(split.commission)} muted />
              <div className="my-2 border-t border-border" />
              <Row label="In escrow" value={formatINR(order.amount)} strong />
            </div>
            <Badge tone="trust" className="mt-3">Razorpay escrow</Badge>
          </Card>

          {showInvoice && (
            <Card>
              <CardTitle>GST invoice</CardTitle>
              <p className="mt-1 text-xs text-subtle">
                Tax invoice for Stuviora&apos;s platform fee · #{order.id}
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <Row label="Platform fee (15%)" value={formatINR(tax.commission)} muted />
                <Row label="GST @ 18%" value={formatINR(tax.gstOnCommission)} muted />
                <div className="my-2 border-t border-border" />
                <Row label="Fee incl. GST" value={formatINR(tax.commissionWithGst)} strong />
              </div>
              <p className="mt-3 text-xs text-subtle">
                GSTIN 29ABCDS0000F1Z5 · SAC 998599. GST applies only to the platform fee, not the
                order value.
              </p>
            </Card>
          )}

          <Card>
            <CardTitle>Student</CardTitle>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                {student?.avatarInitials ?? "S"}
              </span>
              <div className="min-w-0">
                <Link
                  href={`/freelancer/${student?.username}`}
                  className="truncate font-medium hover:underline"
                >
                  {student?.fullName ?? "Student"}
                </Link>
                <div className="text-xs text-muted">
                  {student?.stream} · {student?.trustTier}
                </div>
              </div>
            </div>
            <Link
              href="/messages"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-trust-600 hover:underline"
            >
              <MessageSquare className="h-4 w-4" /> Message
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
      <span className="text-muted">{label}</span>
      <span className={strong ? "font-semibold text-foreground" : muted ? "text-muted" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
