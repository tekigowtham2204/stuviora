import { ScrollText, Lock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listAdminActions } from "@/lib/data/queries";

export const metadata = { title: "Audit trail" };

export default async function AuditTrailPage() {
  const actions = await listAdminActions();

  return (
    <>
      <PageHeader
        eyebrow="Compliance"
        title="Audit trail."
        subtitle="Every privileged action, append-only. Records can never be edited or deleted."
        action={
          <Badge tone="neutral">
            <Lock className="h-3.5 w-3.5" /> Immutable
          </Badge>
        }
      />

      <Card className="p-0">
        <ol className="divide-y divide-[var(--color-line)]">
          {actions.map((a) => (
            <li key={a.id} className="flex gap-4 px-6 py-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-surface-warm)] text-[var(--color-ink-muted)]">
                <ScrollText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-[var(--color-ink)]">
                    {a.action}
                  </span>
                  <span className="font-mono text-xs text-[var(--color-ink-muted)]">
                    {a.target}
                  </span>
                  <span className="ml-auto text-xs text-[var(--color-ink-faint)]">
                    {a.ago}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-[var(--color-ink-muted)]">{a.reason}</p>
                <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                  by {a.adminName}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <p className="mt-4 text-xs text-[var(--color-ink-faint)]">
        Live: backed by the <code className="font-mono">admin_actions</code> table with
        no UPDATE or DELETE grants. Reads are{" "}
        <code className="font-mono">service_role</code> only.
      </p>
    </>
  );
}
