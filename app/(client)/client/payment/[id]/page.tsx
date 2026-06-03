import Link from "next/link";
import { ShieldCheck, Smartphone, CreditCard, Building, Lock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { computeSplit, formatINR } from "@/lib/utils";

export const metadata = { title: "Fund escrow" };

const METHODS = [
  { id: "upi", icon: Smartphone, label: "UPI", sub: "GPay, PhonePe, Paytm. Instant." },
  { id: "card", icon: CreditCard, label: "Card", sub: "Visa, Mastercard, RuPay." },
  { id: "netbanking", icon: Building, label: "Netbanking", sub: "All major Indian banks." },
];

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Demo: bid amount fallback. Live: lookup the proposal/order.
  const amount = 7000;
  const split = computeSplit(amount);

  return (
    <>
      <PageHeader
        title="Fund escrow"
        subtitle={`Hire confirmation · proposal #${id}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardTitle>Choose how to pay</CardTitle>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {METHODS.map((m) => (
                <label
                  key={m.id}
                  className="cursor-pointer rounded-xl border border-border bg-surface p-4 transition-colors hover:border-trust-300"
                >
                  <input type="radio" name="method" value={m.id} defaultChecked={m.id === "upi"} className="peer sr-only" />
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-trust-100 text-trust-700">
                      <m.icon className="h-4 w-4" />
                    </span>
                    <div className="font-medium">{m.label}</div>
                  </div>
                  <p className="mt-2 text-xs text-muted">{m.sub}</p>
                </label>
              ))}
            </div>
            <form action="/client/orders" className="mt-6">
              <Button type="submit" variant="trust" size="lg" className="w-full">
                <Lock className="h-4 w-4" /> Pay {formatINR(amount)} into escrow
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-subtle">
                <ShieldCheck className="h-3.5 w-3.5" /> Payments are processed by Razorpay. Stuviora never sees your card details.
              </p>
            </form>
          </Card>

          <Card>
            <CardTitle>How escrow protects you</CardTitle>
            <ol className="mt-3 space-y-3 text-sm">
              <Step n={1} t="Your money is locked" d="The full amount sits in Razorpay escrow until the work is delivered. No one can touch it." />
              <Step n={2} t="Work happens, AI reviews it" d="The student delivers; our AI gate scores it for completeness and originality before you see it." />
              <Step n={3} t="You approve, money releases" d="One click splits 85% to the student and 15% to Stuviora. Don't respond? Auto-release after 72 hours." />
              <Step n={4} t="Don't like it? Dispute" d="Open a dispute and we mediate within 48 hours. Funds are held until resolved." />
            </ol>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <CardTitle>Order summary</CardTitle>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Job total" value={formatINR(amount)} />
              <Row label="Goes to student (85%)" value={formatINR(split.studentPayout)} muted />
              <Row label="Stuviora platform fee (15%)" value={formatINR(split.commission)} muted />
              <div className="my-2 border-t border-border" />
              <Row label="Pay today" value={formatINR(amount)} strong />
              <p className="text-xs text-subtle">All taxes included. Refund policy applies.</p>
            </div>
            <Badge tone="trust" className="mt-4">
              <ShieldCheck className="h-3.5 w-3.5" /> Escrow-protected
            </Badge>
            <Link
              href="/legal/refund"
              className="mt-3 block text-xs text-muted hover:text-foreground"
            >
              Read the refund policy →
            </Link>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Step({ n, t, d }: { n: number; t: string; d: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-trust-100 text-xs font-semibold text-trust-700">
        {n}
      </span>
      <div>
        <div className="font-medium">{t}</div>
        <p className="text-muted">{d}</p>
      </div>
    </li>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={strong ? "font-semibold text-foreground" : muted ? "text-muted" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
