import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { currentStudent, currentClient } from "@/lib/auth/session";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getSession();
  const isClient = session?.role === "client";
  const me = isClient ? currentClient() : currentStudent();

  return (
    <>
      <PageHeader title="Settings" subtitle="Account, payouts, and notifications." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Profile</CardTitle>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
              {me.avatarInitials}
            </span>
            <div>
              <div className="font-semibold">{me.fullName}</div>
              <div className="text-sm text-muted">
                {isClient
                  ? (me as ReturnType<typeof currentClient>).companyName
                  : `${(me as ReturnType<typeof currentStudent>).stream} · ${(me as ReturnType<typeof currentStudent>).college}`}
              </div>
            </div>
          </div>
          <Button variant="outline" className="mt-4">
            Edit profile
          </Button>
        </Card>

        <Card>
          <CardTitle>Account</CardTitle>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Role" value={isClient ? "Client" : "Student"} />
            <Row label="Email" value="aarav@iitb.ac.in" />
            {!isClient && (
              <>
                <Row label="College verification" value="Verified" badge="trust" />
                <Row label="PAN (for TDS)" value="Add to receive payouts above ₹30k/yr" />
              </>
            )}
            {isClient && (
              <>
                <Row label="GSTIN" value="Optional, for GST invoices" />
                <Row label="Razorpay KYC" value="Verified" badge="trust" />
              </>
            )}
          </div>
        </Card>

        {!isClient && (
          <Card>
            <CardTitle>Payouts</CardTitle>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="UPI" value="aarav@okhdfcbank" />
              <Row label="Bank account" value="HDFC ****4421" />
            </div>
            <Button variant="outline" className="mt-4">
              Update payout details
            </Button>
          </Card>
        )}

        <Card>
          <CardTitle>Notifications</CardTitle>
          <div className="mt-4 space-y-3">
            <Toggle label="Job-match alerts" enabled />
            <Toggle label="Order updates" enabled />
            <Toggle label="Weekly earnings digest" enabled={!isClient} />
            <Toggle label="Marketing & product updates" />
          </div>
        </Card>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: "trust" | "warning";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      {badge ? (
        <Badge tone={badge}>{value}</Badge>
      ) : (
        <span className="text-foreground">{value}</span>
      )}
    </div>
  );
}

function Toggle({ label, enabled = false }: { label: string; enabled?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <span
        aria-hidden
        className={
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors " +
          (enabled ? "bg-brand-500" : "bg-border-strong")
        }
      >
        <span
          className={
            "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform " +
            (enabled ? "translate-x-4" : "translate-x-0.5")
          }
        />
      </span>
    </div>
  );
}
