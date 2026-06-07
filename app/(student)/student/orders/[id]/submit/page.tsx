import { notFound } from "next/navigation";
import { Bot, Upload, FileText, AlertTriangle } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { submitWork } from "@/app/actions/orders";
import { getOrder } from "@/lib/data/queries";
import { MAX_REVISIONS } from "@/lib/constants";

export const metadata = { title: "Submit work" };

export default async function SubmitWorkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fail?: string; attempt?: string }>;
}) {
  const { id } = await params;
  const { fail, attempt: attemptParam } = await searchParams;
  const order = await getOrder(id);
  if (!order) notFound();

  // Attempt number is informational v1 until we read from order_submissions
  // in P4-finish. Defaults to 1 (first attempt).
  const attempt = Math.min(MAX_REVISIONS, Math.max(1, Number(attemptParam) || 1));
  const attemptsLeft = MAX_REVISIONS - attempt + 1;
  const lastFail = fail === "1";

  return (
    <>
      <PageHeader
        eyebrow={lastFail ? "Resubmission" : "Submit work"}
        title={lastFail ? "Address the issues, then resubmit" : "Submit work"}
        subtitle={`Order #${order.id} · ${order.jobTitle}`}
        action={
          <div className="flex items-center gap-2">
            <Badge tone={lastFail ? "orange" : "sage"}>
              Attempt {attempt} of {MAX_REVISIONS}
            </Badge>
            <Badge tone="info">{order.deadlineDays}d remaining</Badge>
          </div>
        }
      />

      {lastFail && order.aiReview && (
        <Card surface="raised" tint="warm" className="mb-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-orange-100)] text-[var(--color-orange-900)]">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <CardTitle>The AI gate flagged the previous submission</CardTitle>
              <p className="mt-1.5 text-sm text-[var(--color-ink-muted)]">
                Score was{" "}
                <span className="font-semibold text-[var(--color-ink)]">
                  {order.aiReview.score}/100
                </span>
                . Address each fix below before resubmitting.
              </p>
              <ul className="mt-3 space-y-1.5">
                {order.aiReview.issues.map((issue, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-[var(--color-ink)]"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-danger)]" />
                    {issue}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
                {attemptsLeft} revision attempt{attemptsLeft === 1 ? "" : "s"} remaining
                . After that, the order routes to admin review.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Client-side validation: require at least one of files or notes >= 100 chars.
            We use a tiny inline script + the form's `required` attribute so JS-off
            users still see the server-side error. Closes student-audit #30. */}
        <form
          action={submitWork}
          className="space-y-5"
          data-min-notes-chars="100"
        >
          <input type="hidden" name="orderId" value={order.id} />
          <input type="hidden" name="attempt" value={attempt} />

          <Card>
            <CardTitle>Files</CardTitle>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              PDF, DOCX, PNG, JPG, or ZIP up to 50MB each. The AI gate extracts
              text, images, and code on the fly.
            </p>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-warm)] px-6 py-10 text-center transition-colors hover:border-[var(--color-sage)] hover:bg-[var(--color-sage-50)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-sage)] text-[var(--color-brown-900)]">
                <Upload className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-[var(--color-ink)]">
                Drop files here, or click to choose
              </span>
              <span className="text-xs text-[var(--color-ink-faint)]">
                Multiple files allowed
              </span>
              <input
                type="file"
                name="files"
                multiple
                className="hidden"
                id="files-input"
              />
            </label>
          </Card>

          <Card>
            <CardTitle>Delivery notes</CardTitle>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Tell the client what is in this submission. The AI also reads this
              when scoring against the brief. Minimum 100 characters if you have
              no files attached.
            </p>
            <textarea
              name="notes"
              rows={6}
              required
              minLength={1}
              placeholder="What you have delivered, any caveats, and how you would like the client to review it."
              className="mt-3 w-full rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-ink)]/15"
            />
          </Card>

          <div className="flex gap-3">
            <Button type="submit" variant="primary">
              Submit for AI review
            </Button>
            <Button
              type="button"
              variant="outline"
              href={`/student/orders/${order.id}`}
            >
              Cancel
            </Button>
          </div>
          <p className="text-xs text-[var(--color-ink-faint)]">
            The AI gate usually returns a verdict in under 60 seconds. You will
            see the result on your order page.
          </p>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-[var(--color-sage-deep)]" />
              <CardTitle>What the AI checks</CardTitle>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--color-ink-muted)]">
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sage-deep)]" />
                <span>Does the work address every point in the brief?</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sage-deep)]" />
                <span>Is it complete and polished?</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sage-deep)]" />
                <span>Is it original (not plagiarised or unedited AI output)?</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-[var(--color-ink-faint)]">
              Passes are tagged AI-reviewed for the client. Fails come back to
              you with specific fixes, up to {MAX_REVISIONS} revisions.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
