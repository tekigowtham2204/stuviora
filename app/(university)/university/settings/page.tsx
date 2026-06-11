import { Link2, RefreshCw, CheckCircle2, Mail } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { scopedPartner, scopedCollege } from "@/lib/auth/university";
import { regenerateInviteCode } from "@/app/actions/university";

export const metadata = { title: "University settings" };

const APP = "https://stuviora.com";

export default async function UniversitySettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;
  const [partner, college] = await Promise.all([scopedPartner(), scopedCollege()]);
  const code = partner?.inviteCode ?? "";
  const inviteUrl = code ? `${APP}/auth/signup/student?ref=${code}` : "";

  return (
    <>
      <PageHeader
        eyebrow={college}
        title="Settings."
        subtitle="Your invite link and partner details."
      />

      {invite && (
        <Card role="status" aria-live="polite" surface="flat" tint="sage" className="mb-6 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <span className="text-[var(--color-sage-900)]">New invite code generated. The old link no longer attributes signups.</span>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <CardTitle>College invite link</CardTitle>
        </div>
        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
          Share this with your students. Anyone who signs up through it is
          attributed to {college}, so their activity counts toward your cohort.
        </p>
        <code className="mt-4 block overflow-x-auto rounded-lg bg-[var(--color-surface-warm)] px-3 py-2 font-mono text-sm text-[var(--color-ink)]">
          {inviteUrl || "no code issued"}
        </code>
        <div className="mt-2 text-xs text-[var(--color-ink-faint)]">
          Referral code: <span className="font-mono">{code || "none"}</span>
        </div>
        <form action={regenerateInviteCode} className="mt-4">
          <Button type="submit" variant="secondary">
            <RefreshCw className="h-4 w-4" /> Regenerate code
          </Button>
        </form>
      </Card>

      <Card className="mt-6" tint="warm">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <CardTitle>Need a change?</CardTitle>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          To update your college name, add staff logins, or revoke access,
          write to partners@stuviora.com and our team will help.
        </p>
      </Card>
    </>
  );
}
