import { Briefcase, Repeat, TrendingUp } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/ui/money";
import type { ClientProfile } from "@/lib/types";
import type { ClientHistory } from "@/lib/clients/history";

interface ClientTrustPanelProps {
  client: Pick<ClientProfile, "companyName" | "city" | "avatarInitials"> | null;
  history: ClientHistory;
}

/**
 * "About the client" trust panel for the student job-detail view. Shows the
 * freelancer.com hire-rate + spend signals so a student can judge whether a
 * client is worth bidding on before writing a proposal.
 */
export function ClientTrustPanel({ client, history }: ClientTrustPanelProps) {
  return (
    <Card>
      <CardTitle>About the client</CardTitle>
      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-orange)] text-base font-semibold text-[var(--color-brown-900)]">
          {client?.avatarInitials ?? "C"}
        </span>
        <div>
          <div className="font-medium text-[var(--color-ink)]">
            {client?.companyName ?? "Client"}
          </div>
          <div className="text-xs text-[var(--color-ink-muted)]">{client?.city}</div>
        </div>
      </div>

      {history.isNew ? (
        <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          New to hiring on Stuviora. {history.jobsPosted} job
          {history.jobsPosted === 1 ? "" : "s"} posted, no hires yet. A strong,
          specific proposal stands out most with first-time clients.
        </p>
      ) : (
        <>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            {history.hireRatePct != null && (
              <div className="rounded-2xl bg-[var(--color-surface-warm)] p-3">
                <dt className="text-xs text-[var(--color-ink-muted)]">Hire rate</dt>
                <dd className="mt-0.5 font-display text-xl font-medium tabular-nums text-[var(--color-ink)]">
                  {history.hireRatePct}%
                </dd>
              </div>
            )}
            <div className="rounded-2xl bg-[var(--color-surface-warm)] p-3">
              <dt className="text-xs text-[var(--color-ink-muted)]">Total spent</dt>
              <dd className="mt-0.5 font-display text-xl font-medium tabular-nums text-[var(--color-ink)]">
                <Money value={history.totalSpent} compact />
              </dd>
            </div>
            {history.inEscrow > 0 && (
              <div className="rounded-2xl bg-[var(--color-surface-warm)] p-3">
                <dt className="text-xs text-[var(--color-ink-muted)]">In escrow now</dt>
                <dd className="mt-0.5 font-display text-xl font-medium tabular-nums text-[var(--color-ink)]">
                  <Money value={history.inEscrow} compact />
                </dd>
              </div>
            )}
            {history.avgOrderValue != null && (
              <div className="rounded-2xl bg-[var(--color-surface-warm)] p-3">
                <dt className="text-xs text-[var(--color-ink-muted)]">Avg project</dt>
                <dd className="mt-0.5 font-display text-xl font-medium tabular-nums text-[var(--color-ink)]">
                  <Money value={history.avgOrderValue} compact />
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--color-ink-muted)]">
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" /> {history.jobsPosted} job
              {history.jobsPosted === 1 ? "" : "s"} posted
            </span>
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> {history.hires} hire
              {history.hires === 1 ? "" : "s"}
            </span>
          </div>

          {history.repeatHires > 0 && (
            <Badge tone="sage" className="mt-4">
              <Repeat className="h-3 w-3" /> Rehires students ({history.repeatHires})
            </Badge>
          )}
        </>
      )}
    </Card>
  );
}
