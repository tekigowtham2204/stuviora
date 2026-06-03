import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { getStudentWallet } from "@/lib/data/queries";
import { withdraw } from "@/app/actions/services";
import { formatINR, cn } from "@/lib/utils";

export const metadata = { title: "Earnings" };

export default async function EarningsPage() {
  const w = await getStudentWallet();

  return (
    <>
      <PageHeader title="Earnings" subtitle="Your wallet, in escrow, and lifetime." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label="Available to withdraw" value={formatINR(w.available)} sub="settled in your wallet" />
        <Stat label="Pending (in escrow)" value={formatINR(w.pending)} sub="releases on client approval" />
        <Stat label="Lifetime earned" value={formatINR(w.lifetime)} sub="net of platform fee" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <CardTitle>Recent activity</CardTitle>
          <Card className="mt-3 divide-y divide-border p-0">
            {w.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      tx.amount >= 0 ? "bg-success-bg text-success" : "bg-warning-bg text-warning"
                    )}
                  >
                    {tx.amount >= 0 ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{tx.description}</div>
                    <div className="text-xs text-muted">{tx.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "text-sm font-semibold",
                      tx.amount >= 0 ? "text-success" : "text-foreground"
                    )}
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    {formatINR(Math.abs(tx.amount))}
                  </div>
                  <Badge tone={tx.status === "settled" ? "success" : tx.status === "pending" ? "warning" : "danger"} className="mt-1">
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <CardTitle>Withdraw</CardTitle>
            <p className="mt-1 text-sm text-muted">
              UPI lands instantly; bank takes 1 working day.
            </p>
            <form action={withdraw} className="mt-4 space-y-3">
              <div>
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  defaultValue={w.available}
                  max={w.available}
                  className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                />
                <p className="mt-1 text-xs text-subtle">
                  Available: {formatINR(w.available)}
                </p>
              </div>
              <div>
                <label htmlFor="destination" className="text-sm font-medium">
                  Destination
                </label>
                <select
                  id="destination"
                  name="destination"
                  className="mt-1 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="upi">UPI ({w.upi})</option>
                  <option value="bank">Bank ({w.bankMasked})</option>
                </select>
              </div>
              <Button type="submit" variant="primary" className="w-full">
                Request withdrawal
              </Button>
            </form>
          </Card>
        </aside>
      </div>
    </>
  );
}
