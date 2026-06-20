import { CheckCircle2, Bell, UserCircle2, Wallet, ShieldCheck, Receipt, AlertTriangle, KeyRound, MonitorSmartphone } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label, FieldHint } from "@/components/ui/input";
import { getSession } from "@/lib/auth/session";
import { currentStudent, currentClient } from "@/lib/auth/session";
import { getNotificationPreferences } from "@/lib/data/queries";
import { saveNotificationPreferences } from "@/app/actions/notifications";
import { saveBilling } from "@/app/actions/billing";
import { enrollTotp, signOutOtherDevices } from "@/app/actions/security";
import { publicUserId } from "@/lib/identity/public-id";

export const metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; security?: string }>;
}) {
  const { saved, error, security } = await searchParams;
  const session = await getSession();
  const isClient = session?.role === "client";
  const me = isClient ? currentClient() : currentStudent();
  const prefs = await getNotificationPreferences(session?.id ?? me.id);

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings."
        subtitle="Profile, payouts, and notification preferences."
      />

      {saved && (
        <Card role="status" aria-live="polite" surface="flat" tint="sage" className="mb-6 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <span className="text-[var(--color-sage-900)]">Saved.</span>
        </Card>
      )}


      {security && (
        <Card role="status" aria-live="polite" surface="flat" tint="sage" className="mb-6 text-sm text-[var(--color-sage-900)]">
          {security === "mfa_demo" &&
            "Two-factor setup recorded. With live keys this shows a QR code to scan in your authenticator app."}
          {security === "mfa_enrolled" &&
            "Two-factor enrollment started. Scan the QR code shown by your authenticator app to finish."}
          {security === "mfa_failed" &&
            "Could not start two-factor enrollment. Try again in a moment."}
          {security === "sessions_cleared" &&
            "Signed out everywhere else. Only this device stays logged in."}
        </Card>
      )}
      {error === "invalid_gstin" && (
        <Card surface="flat" tint="warm" className="mb-6 flex items-start gap-2 border-[var(--color-orange-200)] text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-[var(--color-orange-900)]" />
          <span className="text-[var(--color-orange-900)]">
            That GSTIN does not match the 15-character format. Example: 27ABCDE1234F1Z5.
          </span>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <UserCircle2 className="h-4 w-4 text-[var(--color-ink-muted)]" />
            <CardTitle>Profile</CardTitle>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-sage)] text-xl font-semibold text-[var(--color-brown-900)]">
              {me.avatarInitials}
            </span>
            <div>
              <div className="font-display text-lg text-[var(--color-ink)]">
                {me.fullName}
              </div>
              <div className="text-sm text-[var(--color-ink-muted)]">
                {isClient
                  ? (me as ReturnType<typeof currentClient>).companyName
                  : `${(me as ReturnType<typeof currentStudent>).stream} · ${
                      (me as ReturnType<typeof currentStudent>).college
                    }`}
              </div>
              <div className="mt-1 text-xs text-[var(--color-ink-faint)]">
                Stuviora ID:{" "}
                <span className="font-mono text-[var(--color-ink-muted)]">
                  {publicUserId(
                    session?.role ?? (isClient ? "client" : "student"),
                    session?.id ?? me.id
                  )}
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" className="mt-5">
            Edit profile
          </Button>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--color-ink-muted)]" />
            <CardTitle>Account</CardTitle>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <Row label="Role" value={isClient ? "Client" : "Student"} />
            <Row label="Email" value="aarav@iitb.ac.in" />
            {!isClient && (
              <>
                <Row label="College verification" value="Verified" badge="sage" />
                <Row label="PAN (for TDS)" value="Add before gross earnings cross Rs.5L/yr (TDS)" />
              </>
            )}
            {isClient && (
              <>
                <Row label="GSTIN" value="Optional, for GST invoices" />
                <Row label="Razorpay KYC" value="Verified" badge="sage" />
              </>
            )}
          </div>
        </Card>

        {!isClient && (
          <Card>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[var(--color-ink-muted)]" />
              <CardTitle>Payouts</CardTitle>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <Row label="UPI" value="aarav@okhdfcbank" />
              <Row label="Bank account" value="HDFC ****4421" />
            </div>
            <Button href="/student/payouts" variant="outline" className="mt-5">
              Update payout details
            </Button>
          </Card>
        )}

        <Card>
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[var(--color-ink-muted)]" />
            <CardTitle>Billing</CardTitle>
          </div>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Optional. Adding a GSTIN puts your registration number on every
            order&apos;s invoice so you can reclaim input credit.
          </p>
          <form action={saveBilling} className="mt-5 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input
                id="gstin"
                name="gstin"
                placeholder="27ABCDE1234F1Z5"
                maxLength={15}
                className="font-mono uppercase"
              />
              <FieldHint>
                15 characters. Format: state code + 10 character PAN + 1 + Z + 1.
              </FieldHint>
            </div>
            <Button type="submit" variant="primary" size="sm">
              Save GSTIN
            </Button>
          </form>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[var(--color-ink-muted)]" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <form action={saveNotificationPreferences} className="mt-5 space-y-4">
            <Toggle
              name="emailJobMatches"
              label="Job-match alerts"
              hint="Top-fit jobs emailed daily, capped at 3 per day."
              defaultChecked={prefs.emailJobMatches}
            />
            <Toggle
              name="emailOrderUpdates"
              label="Order updates"
              hint="Status changes on your active orders."
              defaultChecked={prefs.emailOrderUpdates}
            />
            <Toggle
              name="emailWeeklyDigest"
              label="Weekly earnings digest"
              hint="Mondays at 9 AM IST. Skips when there is nothing to report."
              defaultChecked={prefs.emailWeeklyDigest}
            />
            <Toggle
              name="emailMarketing"
              label="Marketing and product updates"
              hint="Occasional news. No spam."
              defaultChecked={prefs.emailMarketing}
            />
            <Button type="submit" variant="primary" size="sm" className="mt-2">
              Save preferences
            </Button>
          </form>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <CardTitle>Security</CardTitle>
        </div>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="text-sm font-medium text-[var(--color-ink)]">
              Two-factor authentication
            </div>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              Protect payouts with a one-time code from an authenticator app.
              Strongly recommended once you have earnings.
            </p>
            <form action={enrollTotp} className="mt-3">
              <Button type="submit" variant="sage" size="sm">
                Set up 2FA
              </Button>
            </form>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)]">
              <MonitorSmartphone className="h-4 w-4" /> Active sessions
            </div>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              Left yourself logged in on a hostel or lab computer? Sign out
              everywhere except this device.
            </p>
            <form action={signOutOtherDevices} className="mt-3">
              <Button type="submit" variant="secondary" size="sm">
                Sign out other devices
              </Button>
            </form>
          </div>
        </div>
      </Card>
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
  badge?: "sage" | "yellow";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[var(--color-ink-muted)]">{label}</span>
      {badge ? (
        <Badge tone={badge}>{value}</Badge>
      ) : (
        <span className="text-[var(--color-ink)]">{value}</span>
      )}
    </div>
  );
}

function Toggle({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer">
      <span className="flex-1">
        <span className="block text-sm font-medium text-[var(--color-ink)]">{label}</span>
        {hint && (
          <span className="mt-0.5 block text-xs text-[var(--color-ink-muted)]">{hint}</span>
        )}
      </span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-[var(--color-line-strong)] transition-colors has-[:checked]:bg-[var(--color-sage-deep)]">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
