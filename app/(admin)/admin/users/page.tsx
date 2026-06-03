import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listAdminUsers } from "@/lib/data/queries";
import { toggleUserActive } from "@/app/actions/admin";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const users = await listAdminUsers();

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Every account, its lifetime value, and account controls."
      />

      <Card className="p-0">
        {/* Header (desktop) */}
        <div className="hidden grid-cols-[1.5fr_1fr_0.8fr_1fr_auto] gap-4 border-b border-border px-5 py-3 text-xs font-medium text-subtle md:grid">
          <span>User</span>
          <span>Role / tier</span>
          <span>Status</span>
          <span className="text-right">Lifetime value</span>
          <span className="text-right">Action</span>
        </div>
        <div className="divide-y divide-border">
          {users.map((u) => (
            <div
              key={u.id}
              className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[1.5fr_1fr_0.8fr_1fr_auto] md:items-center md:gap-4"
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{u.name}</div>
                <div className="truncate text-xs text-muted">{u.email}</div>
                <div className="text-xs text-subtle">Joined {u.joinedAgo}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={u.role === "client" ? "trust" : u.role === "admin" ? "brand" : "info"} className="capitalize">
                  {u.role}
                </Badge>
                {u.trustTier && (
                  <span className="text-xs capitalize text-muted">{u.trustTier}</span>
                )}
              </div>
              <div>
                <Badge tone={u.isActive ? "success" : "danger"}>
                  {u.isActive ? "Active" : "Suspended"}
                </Badge>
              </div>
              <div className="font-semibold md:text-right">{formatINR(u.gmv)}</div>
              <div className="md:text-right">
                <form action={toggleUserActive}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="activate" value={u.isActive ? "false" : "true"} />
                  <input
                    type="hidden"
                    name="reason"
                    value={u.isActive ? "Manual suspension by admin" : "Reactivated by admin"}
                  />
                  <Button type="submit" variant={u.isActive ? "ghost" : "outline"} size="sm">
                    {u.isActive ? "Suspend" : "Reactivate"}
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="mt-3 text-xs text-subtle">
        Suspending an account blocks new orders and is recorded in the audit trail. It does not
        affect in-flight escrow.
      </p>
    </>
  );
}
