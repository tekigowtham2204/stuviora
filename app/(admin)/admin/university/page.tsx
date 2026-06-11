import { University, TrendingUp, Users, Award, KeyRound, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/ui/money";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import * as demo from "@/lib/demo/data";
import { rollupCohorts } from "@/lib/university/engine";
import { issuePartner, revokePartner } from "@/app/actions/university";

export const metadata = { title: "University B2B" };

export default async function UniversityPage({
  searchParams,
}: {
  searchParams: Promise<{ issued?: string; revoked?: string; error?: string }>;
}) {
  const { issued, revoked, error } = await searchParams;
  const summary = rollupCohorts(demo.students, demo.adminUsers, demo.orders);
  const activationPct = summary.totalStudents
    ? Math.round((summary.totalActivated / summary.totalStudents) * 100)
    : 0;

  return (
    <>
      <PageHeader
        eyebrow="University partnerships"
        title="College cohort performance."
        subtitle="Activation, GMV, and engagement for every college on Stuviora. Wire to your placement cell via the public REST API or HMAC-signed webhooks."
      />

      {(issued || revoked) && (
        <Card role="status" aria-live="polite" surface="flat" tint="sage" className="mb-6 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <span className="text-[var(--color-sage-900)]">
            {issued
              ? `Partner issued: key ${issued}. The secret is shown once in live mode; share it securely.`
              : `Partner ${revoked} revoked. Its key no longer authenticates.`}
          </span>
        </Card>
      )}
      {error && (
        <Card surface="flat" tint="warm" className="mb-6 text-sm text-[var(--color-orange-900)]">
          {error === "missing_college" ? "Enter a college name to issue a partner." : "Missing partner key."}
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={<Users className="h-3.5 w-3.5" />}
          label="Students"
          value={String(summary.totalStudents)}
          sub="across cohorts"
          accent="ink"
        />
        <Stat
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Activated"
          value={String(summary.totalActivated)}
          sub={`${activationPct}% activation`}
          accent="sage"
        />
        <Stat
          icon={<University className="h-3.5 w-3.5" />}
          label="Cohorts"
          value={String(summary.topColleges.length)}
          sub="colleges represented"
          accent="orange"
        />
        <Stat
          icon={<Award className="h-3.5 w-3.5" />}
          label="GMV"
          value={`Rs.${(summary.totalGmv / 100000).toFixed(1)}L`}
          sub="lifetime, college-attributed"
          accent="yellow"
        />
      </div>

      <Card className="mt-8" surface="raised">
        <div className="mb-4 flex items-center justify-between">
          <CardTitle>Cohorts by GMV</CardTitle>
          <span className="text-xs text-[var(--color-ink-muted)]">
            Sorted by lifetime college GMV
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                <th className="pb-3 pr-4">College</th>
                <th className="pb-3 pr-4">Students</th>
                <th className="pb-3 pr-4">Activated</th>
                <th className="pb-3 pr-4">Activation</th>
                <th className="pb-3 pr-4">GMV</th>
                <th className="pb-3">Per student</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {summary.topColleges.map((c) => (
                <tr key={c.college} className="text-[var(--color-ink)]">
                  <td className="py-3 pr-4 font-medium">{c.college}</td>
                  <td className="py-3 pr-4 tabular-nums">{c.students}</td>
                  <td className="py-3 pr-4 tabular-nums">{c.activated}</td>
                  <td className="py-3 pr-4">
                    <ActivationPill rate={c.activationRate} />
                  </td>
                  <td className="py-3 pr-4 tabular-nums">
                    <Money value={c.gmv} compact />
                  </td>
                  <td className="py-3 tabular-nums">
                    <Money value={c.gmvPerStudent} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card surface="raised" className="mt-6" tint="warm">
        <CardTitle>Wire your placement cell</CardTitle>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          A read-only REST API exposes activation, GMV-by-month, and top categories per
          college. Webhook deliveries fire on first-completed-job and tier-upgrades.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <CodeBlock title="GET /api/v1/university/students/activated">
            Returns activated students for your cohort.
          </CodeBlock>
          <CodeBlock title="GET /api/v1/university/gmv/monthly">
            Monthly GMV time series for your cohort.
          </CodeBlock>
          <CodeBlock title="POST webhook student.completed_first_job">
            HMAC-signed delivery on first completion.
          </CodeBlock>
        </div>
      </Card>

      <Card surface="raised" className="mt-6">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <CardTitle>Issue or revoke a partner</CardTitle>
        </div>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          Mint an HMAC key + invite code for a placement cell, or revoke one.
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <form action={issuePartner} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="college">College</Label>
              <Input id="college" name="college" placeholder="IIT Bombay" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="partnerName">Partner name (optional)</Label>
              <Input id="partnerName" name="partnerName" placeholder="IIT Bombay Placement Cell" />
            </div>
            <Button type="submit" variant="sage" size="sm">Issue partner</Button>
          </form>
          <form action={revokePartner} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="keyId">Revoke key id</Label>
              <Input id="keyId" name="keyId" placeholder="iit-bombay-a1b2c3" />
            </div>
            <Button type="submit" variant="secondary" size="sm">Revoke partner</Button>
          </form>
        </div>
      </Card>
    </>
  );
}

function ActivationPill({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100);
  const tone = rate >= 0.5 ? "sage" : rate >= 0.25 ? "yellow" : "orange";
  return <Badge tone={tone}>{pct}%</Badge>;
}

function CodeBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
      <code className="block font-mono text-xs text-[var(--color-ink)]">{title}</code>
      <p className="mt-2 text-xs text-[var(--color-ink-muted)]">{children}</p>
    </div>
  );
}
