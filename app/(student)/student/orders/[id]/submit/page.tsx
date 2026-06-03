import { notFound } from "next/navigation";
import { Bot, Upload, FileText } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { submitWork } from "@/app/actions/orders";
import { getOrder } from "@/lib/data/queries";

export const metadata = { title: "Submit work" };

export default async function SubmitWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <>
      <PageHeader
        title="Submit work"
        subtitle={`Order #${order.id} · ${order.jobTitle}`}
        action={<Badge tone="info">{order.deadlineDays}d remaining</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form action={submitWork} className="space-y-5">
          <input type="hidden" name="orderId" value={order.id} />

          <Card>
            <CardTitle>Files</CardTitle>
            <p className="mt-1 text-sm text-muted">
              PDF, DOCX, PNG, JPG, or ZIP up to 50MB each. The AI gate extracts text, images, and code on the fly.
            </p>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-strong bg-surface-muted px-6 py-10 text-center transition-colors hover:border-brand-300 hover:bg-brand-50">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <Upload className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Drop files here, or click to choose</span>
              <span className="text-xs text-subtle">Multiple files allowed</span>
              <input type="file" name="files" multiple className="hidden" />
            </label>
          </Card>

          <Card>
            <CardTitle>Delivery notes</CardTitle>
            <p className="mt-1 text-sm text-muted">
              Tell the client what&apos;s in this submission. The AI also uses this to evaluate against the brief.
            </p>
            <textarea
              name="notes"
              rows={6}
              placeholder="What you've delivered, any caveats, and how you'd like the client to review it."
              className="mt-3 w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
            />
          </Card>

          <div className="flex gap-3">
            <Button type="submit" variant="primary">
              Submit for AI review
            </Button>
            <Button type="button" variant="outline" href={`/student/orders/${order.id}`}>
              Cancel
            </Button>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-brand-600" />
              <CardTitle>What the AI checks</CardTitle>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-trust-600" />
                <span>Does the work address every point in the brief?</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-trust-600" />
                <span>Is it complete and polished?</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-trust-600" />
                <span>Is it original (not plagiarised or unedited AI output)?</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-subtle">
              Passes are tagged &quot;AI-reviewed&quot; for the client. Fails come back to you with specific fixes; you have up to 3 revisions.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
