import { ScrollText, Lock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listAdminActions } from "@/lib/data/queries";

export const metadata = { title: "Audit trail" };

export default async function AuditTrailPage() {
  const actions = await listAdminActions();

  return (
    <>
      <PageHeader
        title="Audit trail"
        subtitle="Every privileged action, append-only. Records can never be edited or deleted."
        action={
          <Badge tone="neutral">
            <Lock className="h-3.5 w-3.5" /> Immutable
          </Badge>
        }
      />

      <Card className="p-0">
        <ol className="divide-y divide-border">
          {actions.map((a) => (
            <li key={a.id} className="flex gap-3 px-5 py-4">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-subtle">
                <ScrollText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{a.action}</span>
                  <span className="font-mono text-xs text-muted">{a.target}</span>
                  <span className="ml-auto text-xs text-subtle">{a.ago}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{a.reason}</p>
                <p className="mt-1 text-xs text-subtle">by {a.adminName}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <p className="mt-3 text-xs text-subtle">
        Live: backed by the <code className="font-mono">admin_actions</code> table with no UPDATE
        or DELETE grants. Reads are <code className="font-mono">service_role</code> only.
      </p>
    </>
  );
}
