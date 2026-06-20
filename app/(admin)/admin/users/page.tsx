import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { TrustTierBadge } from "@/components/ui/trust-tier-badge";
import { listAdminUsers } from "@/lib/data/queries";
import { toggleUserActive } from "@/app/actions/admin";
import { publicUserId } from "@/lib/identity/public-id";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const users = await listAdminUsers();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Users."
        subtitle="Every account, its lifetime value, and account controls."
      />

      <Card className="p-0">
        <div className="hidden grid-cols-[1.5fr_1fr_0.8fr_1fr_auto] gap-4 border-b border-[var(--color-line)] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)] md:grid">
          <span>User</span>
          <span>Role / tier</span>
          <span>Status</span>
          <span className="text-right">Lifetime value</span>
          <span className="text-right">Action</span>
        </div>
        <div className="divide-y divide-[var(--color-line)]">
          {users.map((u) => (
            <div
              key={u.id}
              className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[1.5fr_1fr_0.8fr_1fr_auto] md:items-center md:gap-4"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-[var(--color-ink)]">
                  {u.name}
                </div>
                <div className="truncate text-xs text-[var(--color-ink-muted)]">
                  {u.email}
                </div>
                <div className="text-xs text-[var(--color-ink-faint)]">
                  <span className="font-mono">{publicUserId(u.role, u.id)}</span> · Joined{" "}
                  {u.joinedAgo}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    u.role === "client" ? "orange" : u.role === "admin" ? "yellow" : "sage"
                  }
                  className="capitalize"
                >
                  {u.role}
                </Badge>
                {u.trustTier && <TrustTierBadge tier={u.trustTier} size="sm" />}
              </div>
              <div>
                <Badge tone={u.isActive ? "sage" : "danger"}>
                  {u.isActive ? "Active" : "Suspended"}
                </Badge>
              </div>
              <div className="font-display text-base tabular-nums text-[var(--color-ink)] md:text-right">
                <Money value={u.gmv} compact />
              </div>
              <div className="md:text-right">
                <form action={toggleUserActive}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input
                    type="hidden"
                    name="activate"
                    value={u.isActive ? "false" : "true"}
                  />
                  <input
                    type="hidden"
                    name="reason"
                    value={
                      u.isActive ? "Manual suspension by admin" : "Reactivated by admin"
                    }
                  />
                  <Button
                    type="submit"
                    variant={u.isActive ? "ghost" : "outline"}
                    size="sm"
                  >
                    {u.isActive ? "Suspend" : "Reactivate"}
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="mt-4 text-xs text-[var(--color-ink-faint)]">
        Suspending an account blocks new orders and is recorded in the audit trail. It
        does not affect in-flight escrow.
      </p>
    </>
  );
}
