import {
  Wallet,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label, FieldHint } from "@/components/ui/input";
import { Money } from "@/components/ui/money";
import { savePayoutDetails } from "@/app/actions/billing";
import { getStudentWallet } from "@/lib/data/queries";

export const metadata = { title: "Payouts" };

const ERRORS: Record<string, string> = {
  invalid_upi:
    "That UPI ID does not look right. Format: username@bank (e.g. yourname@okhdfcbank).",
  invalid_ifsc:
    "That IFSC code does not look right. 11 characters, e.g. HDFC0001234.",
  invalid_account:
    "That account number does not look right. 9 to 18 digits.",
};

export default async function PayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const wallet = await getStudentWallet();

  return (
    <>
      <PageHeader
        eyebrow="Money in"
        title="Payout details."
        subtitle="Where your 85% lands when an order completes. UPI typically settles in under 5 minutes; bank takes one working day."
      />

      {saved && (
        <Card
          role="status"
          aria-live="polite"
          surface="flat"
          tint="sage"
          className="mb-6 flex items-center gap-2 text-sm"
        >
          <CheckCircle2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <span className="text-[var(--color-sage-900)]">
            Payout details saved. Future payouts use the new account.
          </span>
        </Card>
      )}

      {error && ERRORS[error] && (
        <Card
          surface="flat"
          tint="warm"
          className="mb-6 flex items-start gap-2 border-[var(--color-orange-200)] text-sm"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 text-[var(--color-orange-900)]" />
          <span className="text-[var(--color-orange-900)]">{ERRORS[error]}</span>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form action={savePayoutDetails} className="space-y-6">
          <Card>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[var(--color-sage-deep)]" />
              <CardTitle>UPI</CardTitle>
            </div>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Fastest option. Razorpay settles a UPI payout in under five
              minutes, any day of the week. Recommended for amounts under
              Rs.50,000 per transfer.
            </p>
            <div className="mt-5 space-y-1.5">
              <Label htmlFor="upi">UPI ID</Label>
              <Input
                id="upi"
                name="upi"
                placeholder={wallet.upi || "yourname@okhdfcbank"}
                defaultValue={wallet.upi}
              />
              <FieldHint>
                Use any bank or wallet UPI (PhonePe, GPay, BHIM). Format:
                username@bank.
              </FieldHint>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-[var(--color-orange)]" />
              <CardTitle>Bank account</CardTitle>
            </div>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Needed for amounts over Rs.50,000 or as a backup if your UPI
              fails. Bank transfers settle in one working day.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ifsc">IFSC code</Label>
                <Input
                  id="ifsc"
                  name="ifsc"
                  placeholder="HDFC0001234"
                  className="font-mono uppercase"
                />
                <FieldHint>11 characters; look at the front of your cheque.</FieldHint>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="accountNumber">Account number</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  placeholder={wallet.bankMasked.replace(/.*\s/, "")}
                  className="font-mono"
                />
                <FieldHint>9 to 18 digits, no spaces.</FieldHint>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary">
              Save payout details
            </Button>
            <Button href="/student/earnings" variant="outline">
              Cancel
            </Button>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card tint="warm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--color-sage-deep)]" />
              <CardTitle>How we handle this</CardTitle>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Bank account numbers are encrypted at rest using Supabase Vault.
              UPI IDs are stored in plaintext (they are not secret, only an
              identifier). Razorpay sees the full UPI / account at payout
              time only.
            </p>
          </Card>

          <Card>
            <CardTitle>What is in your wallet</CardTitle>
            <div className="mt-4 space-y-2.5 text-sm">
              <Row label="Available now" value={<Money value={wallet.available} />} />
              <Row label="Pending in escrow" value={<Money value={wallet.pending} />} />
              <Row label="Lifetime earned" value={<Money value={wallet.lifetime} />} />
            </div>
            <div className="mt-5">
              <Button href="/student/earnings" variant="outline" size="sm">
                See wallet activity →
              </Button>
            </div>
          </Card>

          <Card>
            <CardTitle>Verification status</CardTitle>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-ink-muted)]">UPI</span>
                {wallet.upi ? (
                  <Badge tone="sage">On file</Badge>
                ) : (
                  <Badge tone="orange">Not set</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-ink-muted)]">Bank account</span>
                {wallet.bankMasked ? (
                  <Badge tone="sage">On file</Badge>
                ) : (
                  <Badge tone="orange">Not set</Badge>
                )}
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[var(--color-ink-muted)]">{label}</span>
      <span className="font-medium text-[var(--color-ink)]">{value}</span>
    </div>
  );
}
