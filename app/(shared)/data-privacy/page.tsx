import {
  ShieldCheck,
  Download,
  Trash2,
  CheckCircle2,
  LifeBuoy,
  GraduationCap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea, Label } from "@/components/ui/input";
import {
  DATA_PRINCIPAL_RIGHTS,
  CONSENT_PURPOSES,
} from "@/lib/privacy/consent";
import { requestAccountDeletion, setShareWithCollege } from "@/app/actions/privacy";
import { getSession } from "@/lib/auth/session";
import { SHARE_WITH_COLLEGE_IDS } from "@/lib/demo/data";

export const metadata = { title: "Data and privacy" };

export default async function DataPrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ deletion?: string; shared?: string }>;
}) {
  const { deletion, shared } = await searchParams;
  const session = await getSession();
  const sharing = session ? SHARE_WITH_COLLEGE_IDS.has(session.id) : false;

  return (
    <>
      <PageHeader
        eyebrow="Privacy"
        title="Your data and privacy."
        subtitle="Access, export, or erase your personal data. We follow India's DPDP Act."
      />

      {shared && (
        <Card role="status" aria-live="polite" surface="flat" tint="sage" className="mb-6 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <span className="text-[var(--color-sage-900)]">
            {shared === "on"
              ? "You are now sharing your activity with your college."
              : "You have stopped sharing with your college."}
          </span>
        </Card>
      )}

      <Card className="mb-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <CardTitle>Share with my college</CardTitle>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Let your college&apos;s placement cell see your name, activity, and
          earnings band in their cohort dashboard. Off by default. Cohort totals
          never identify you; only this opt-in adds your individual row.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Badge tone={sharing ? "sage" : "neutral"}>
            {sharing ? "Sharing on" : "Sharing off"}
          </Badge>
          <form action={setShareWithCollege}>
            <input type="hidden" name="share" value={sharing ? "false" : "true"} />
            <Button type="submit" variant={sharing ? "secondary" : "sage"} size="sm">
              {sharing ? "Stop sharing" : "Share with my college"}
            </Button>
          </form>
        </div>
      </Card>

      {deletion === "requested" && (
        <Card
          role="status"
          aria-live="polite"
          surface="flat"
          tint="sage"
          className="mb-6 flex items-center gap-2 text-sm"
        >
          <CheckCircle2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <span className="text-[var(--color-sage-900)]">
            Deletion requested. Your account is scheduled for erasure in 7 days.
            You can cancel any time before then.
          </span>
        </Card>
      )}
      {deletion === "cancelled" && (
        <Card
          role="status"
          aria-live="polite"
          surface="flat"
          tint="sage"
          className="mb-6 flex items-center gap-2 text-sm"
        >
          <CheckCircle2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <span className="text-[var(--color-sage-900)]">
            Deletion cancelled. Your account stays active.
          </span>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rights */}
        <Card>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--color-sage-deep)]" />
            <CardTitle>Your rights</CardTitle>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-ink-muted)]">
            {DATA_PRINCIPAL_RIGHTS.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sage-deep)]" />
                {r}
              </li>
            ))}
          </ul>
        </Card>

        {/* Download */}
        <Card>
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-[var(--color-sage-deep)]" />
            <CardTitle>Download your data</CardTitle>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
            Get a machine-readable copy of your profile, orders, proposals,
            and other records as a JSON file.
          </p>
          <Button href="/api/privacy/export" variant="sage" className="mt-5">
            <Download className="h-4 w-4" /> Download my data
          </Button>
        </Card>

        {/* Consent summary */}
        <Card>
          <CardTitle>What we process, and why</CardTitle>
          <ul className="mt-4 space-y-3 text-sm">
            {CONSENT_PURPOSES.map((p) => (
              <li key={p.key}>
                <div className="flex items-center gap-2 font-medium text-[var(--color-ink)]">
                  {p.label}
                  {p.essential && <Badge tone="neutral">Required</Badge>}
                </div>
                <p className="text-[var(--color-ink-muted)]">{p.description}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[var(--color-ink-faint)]">
            Manage optional consents from the cookie banner or your
            notification settings.
          </p>
        </Card>

        {/* Grievance + deletion */}
        <div className="space-y-6">
          <Card tint="warm">
            <div className="flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-[var(--color-sage-deep)]" />
              <CardTitle>Grievance officer</CardTitle>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Have a data concern? Write to our grievance officer at{" "}
              <span className="font-medium text-[var(--color-ink)]">
                privacy@stuviora.com
              </span>
              . We respond within 90 days, as required by law.
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-[var(--color-danger-deep)]" />
              <CardTitle>Delete your account</CardTitle>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              This erases your personal data after a 7-day grace window. In-flight
              orders and payouts settle first. This cannot be undone once
              processed.
            </p>
            <form action={requestAccountDeletion} className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  placeholder="Tell us why you are leaving (optional)."
                />
              </div>
              <Button type="submit" variant="secondary">
                Request account deletion
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
