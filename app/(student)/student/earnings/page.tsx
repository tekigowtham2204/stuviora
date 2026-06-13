import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { Input, Label, Select } from "@/components/ui/input";
import { Money } from "@/components/ui/money";
import { getStudentWallet } from "@/lib/data/queries";
import { withdraw, setAutoWithdraw } from "@/app/actions/services";
import { autoWithdraw } from "@/lib/demo/state";
import { TDS_THRESHOLD, TDS_RATE } from "@/lib/tax/engine";
import { cn } from "@/lib/utils";

export const metadata = { title: "Earnings" };

export default async function EarningsPage({
  searchParams,
}: {
  searchParams: Promise<{ withdrawn?: string; auto?: string }>;
}) {
  const { withdrawn, auto } = await searchParams;
  const w = await getStudentWallet();

  // TDS proximity: warn the student BEFORE the first ₹30k cross, so the
  // first withholding does not surprise them. Closes student-audit #36.
  // Lifetime is a stand-in for FY gross until live commission_events
  // rolls up by FY (P3 wiring).
  const fyGrossEstimate = w.lifetime;
  const remainingBeforeTds = TDS_THRESHOLD - fyGrossEstimate;
  const tdsApplies = remainingBeforeTds <= 0;
  const tdsClose = remainingBeforeTds > 0 && remainingBeforeTds <= 5000;
  const tdsPct = Math.min(100, Math.round((fyGrossEstimate / TDS_THRESHOLD) * 100));

  return (
    <>
      <PageHeader
        eyebrow="Wallet"
        title="Earnings."
        subtitle="Your wallet, what is in escrow, and the lifetime view."
      />

      {withdrawn && Number(withdrawn) > 0 && (
        <Card role="status" aria-live="polite" surface="flat" tint="sage" className="mt-6 text-sm text-[var(--color-sage-900)]">
          Withdrawal of Rs.{Number(withdrawn).toLocaleString("en-IN")} is on its
          way. If this was your first one: that is real money earned from real
          work. Tell your friends how it felt.
        </Card>
      )}
      {auto && (
        <Card role="status" aria-live="polite" surface="flat" tint="sage" className="mt-6 text-sm text-[var(--color-sage-900)]">
          {auto === "off"
            ? "Auto-withdraw is off."
            : `Auto-withdraw is on: your balance sweeps to your account whenever it crosses Rs.${Number(auto).toLocaleString("en-IN")}.`}
        </Card>
      )}

      {(tdsApplies || tdsClose) && (
        <Card
          surface="flat"
          tint="warm"
          className="mb-6 border-[var(--color-orange-200)]"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-orange-100)] text-[var(--color-orange-900)]">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <CardTitle>
                {tdsApplies
                  ? `TDS now applies on your earnings this FY`
                  : `${remainingBeforeTds.toLocaleString(
                      "en-IN"
                    )} rupees away from TDS withholding`}
              </CardTitle>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                Section 194-O withholds {TDS_RATE * 100}% on freelance
                commission once your financial-year gross crosses{" "}
                <Money value={TDS_THRESHOLD} />.{" "}
                {tdsApplies
                  ? "Each payout this FY now arrives net of TDS; the withheld amount appears as a credit on your Form 16A."
                  : "Your next payout could be the one that crosses. Make sure your PAN is on file so we can compliantly withhold and report."}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-surface)]">
                <div
                  className={cn(
                    "h-full rounded-full",
                    tdsApplies
                      ? "bg-[var(--color-orange-deep)]"
                      : "bg-[var(--color-yellow-deep)]"
                  )}
                  style={{ width: `${tdsPct}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--color-ink-muted)]">
                <span>
                  <Money value={fyGrossEstimate} /> /{" "}
                  <Money value={TDS_THRESHOLD} /> FY
                </span>
                <Button href="/student/tax" variant="ghost" size="sm">
                  See tax + PAN
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

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
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-medium text-[var(--color-ink)]">
              Recent activity
            </h2>
            <Button href="/api/student/wallet/export" variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
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
            <form action={setAutoWithdraw} className="mt-5 space-y-2 border-t border-[var(--color-line)] pt-4">
              <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                <input
                  type="checkbox"
                  name="enabled"
                  defaultChecked={autoWithdraw.threshold !== null}
                  className="h-4 w-4 accent-[var(--color-sage-deep)]"
                />
                Auto-withdraw when balance crosses
              </label>
              <div className="flex items-center gap-2">
                <Input
                  name="threshold"
                  type="number"
                  min={100}
                  defaultValue={autoWithdraw.threshold ?? 5000}
                  className="h-10"
                />
                <Button type="submit" variant="secondary" size="sm">Save</Button>
              </div>
              <p className="text-xs text-[var(--color-ink-faint)]">
                No more logging in just to tap Withdraw.
              </p>
            </form>
          </Card>
        </aside>
      </div>
    </>
  );
}
