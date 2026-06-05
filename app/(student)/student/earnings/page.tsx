import { ArrowDownRight, ArrowUpRight, Wallet, ShieldCheck, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { Input, Label, Select } from "@/components/ui/input";
import { Money } from "@/components/ui/money";
import { getStudentWallet } from "@/lib/data/queries";
import { withdraw } from "@/app/actions/services";
import { cn } from "@/lib/utils";

export const metadata = { title: "Earnings" };

export default async function EarningsPage() {
  const w = await getStudentWallet();

  return (
    <>
      <PageHeader
        eyebrow="Wallet"
        title="Earnings."
        subtitle="Your wallet, what is in escrow, and the lifetime view."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat
          icon={<Wallet className="h-3.5 w-3.5" />}
          label="Available"
          value={`Rs.${w.available.toLocaleString("en-IN")}`}
          sub="settled in your wallet"
          accent="ink"
        />
        <Stat
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          label="Pending"
          value={`Rs.${w.pending.toLocaleString("en-IN")}`}
          sub="releases on client approval"
          accent="yellow"
        />
        <Stat
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Lifetime"
          value={`Rs.${w.lifetime.toLocaleString("en-IN")}`}
          sub="net of platform fee"
          accent="sage"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="mb-3 font-display text-xl font-medium text-[var(--color-ink)]">
            Recent activity
          </h2>
          <Card className="divide-y divide-[var(--color-line)] p-0">
            {w.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                      tx.amount >= 0
                        ? "bg-[var(--color-sage-100)] text-[var(--color-sage-900)]"
                        : "bg-[var(--color-orange-100)] text-[var(--color-orange-900)]"
                    )}
                  >
                    {tx.amount >= 0 ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-ink)]">
                      {tx.description}
                    </div>
                    <div className="text-xs text-[var(--color-ink-muted)]">{tx.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "font-display text-lg tabular-nums",
                      tx.amount >= 0
                        ? "text-[var(--color-sage-900)]"
                        : "text-[var(--color-ink)]"
                    )}
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    <Money value={Math.abs(tx.amount)} />
                  </div>
                  <Badge
                    tone={
                      tx.status === "settled"
                        ? "sage"
                        : tx.status === "pending"
                        ? "yellow"
                        : "danger"
                    }
                    className="mt-1"
                  >
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
            <p className="mt-1.5 text-sm text-[var(--color-ink-muted)]">
              UPI lands instantly. Bank takes 1 working day.
            </p>
            <form action={withdraw} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  defaultValue={w.available}
                  max={w.available}
                />
                <p className="text-xs text-[var(--color-ink-faint)]">
                  Available: <Money value={w.available} />
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="destination">Destination</Label>
                <Select id="destination" name="destination">
                  <option value="upi">UPI ({w.upi})</option>
                  <option value="bank">Bank ({w.bankMasked})</option>
                </Select>
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
