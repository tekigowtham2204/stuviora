import { notFound } from "next/navigation";
import { Clock, Users, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getJob, getClientById } from "@/lib/data/queries";
import { submitProposal } from "@/app/actions/jobs";
import { currentStudent } from "@/lib/auth/session";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "Job detail" };

export default async function StudentJobDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const client = await getClientById(job.clientId);
  const me = currentStudent();
  const suggestedBid = Math.round((job.budgetMin + job.budgetMax) / 2);

  return (
    <>
      <PageHeader title={job.title} subtitle={`Posted ${job.createdAgo} by ${client?.companyName ?? "a client"}`} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="font-medium">
                {formatINR(job.budgetMin)} to {formatINR(job.budgetMax)}
              </span>
              <span className="inline-flex items-center gap-1 text-muted">
                <Clock className="h-4 w-4" /> {job.deadlineDays}-day deadline
              </span>
              <span className="inline-flex items-center gap-1 text-muted">
                <Users className="h-4 w-4" /> {job.proposalsCount} proposals so far
              </span>
            </div>
            <div className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Brief
              </h2>
              <p className="mt-2 text-base leading-relaxed text-foreground">{job.description}</p>
            </div>
            <div className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Skills wanted
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <span key={s} className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-muted">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Bid form */}
          <Card>
            <CardTitle>Submit your proposal</CardTitle>
            <form action={submitProposal} className="mt-4 space-y-4">
              <input type="hidden" name="jobId" value={job.id} />
              <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Sparkles className="h-4 w-4" /> AI pricing hint
                </span>
                <p className="mt-1 text-brand-700/90">
                  Based on brief complexity and your {me.trustTier} tier, a bid around{" "}
                  <strong>{formatINR(suggestedBid)}</strong> wins this kind of work most often.
                </p>
              </div>

              <div>
                <label htmlFor="coverLetter" className="text-sm font-medium">
                  Your pitch
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  rows={5}
                  defaultValue={`Hi! I'm a ${me.stream} student at ${me.college}. I can take this on and deliver within the deadline. Happy to share a small sample first.`}
                  className="mt-1 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                />
                <p className="mt-1 text-xs text-subtle">
                  Tip: the AI proposal writer will tailor this to the brief in one click (coming soon).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bidAmount" className="text-sm font-medium">
                    Your bid (INR)
                  </label>
                  <input
                    id="bidAmount"
                    name="bidAmount"
                    type="number"
                    defaultValue={suggestedBid}
                    className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div>
                  <label htmlFor="deliveryDays" className="text-sm font-medium">
                    Delivery (days)
                  </label>
                  <input
                    id="deliveryDays"
                    name="deliveryDays"
                    type="number"
                    defaultValue={Math.max(1, Math.round(job.deadlineDays * 0.8))}
                    className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Submit proposal
              </Button>
            </form>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <CardTitle>About the client</CardTitle>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-trust-100 font-semibold text-trust-700">
                {client?.avatarInitials ?? "C"}
              </span>
              <div>
                <div className="font-medium">{client?.companyName ?? "Client"}</div>
                <div className="text-xs text-muted">{client?.city}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted">
              {client?.jobsPosted ?? 0} jobs posted on Stuviora
            </div>
          </Card>
          <Card>
            <CardTitle>How payment works</CardTitle>
            <p className="mt-2 text-sm text-muted">
              When the client hires you, they fund Razorpay escrow upfront. You get paid 85% on approval, with 72-hour auto-release if they don&apos;t respond.
            </p>
            <Badge tone="trust" className="mt-3">Escrow-protected</Badge>
          </Card>
        </aside>
      </div>
    </>
  );
}
