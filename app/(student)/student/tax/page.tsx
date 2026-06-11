import {
  Download,
  FileText,
  ShieldCheck,
  AlertTriangle,
  IndianRupee,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Money } from "@/components/ui/money";
import { currentStudent } from "@/lib/auth/session";
import { savePan } from "@/app/actions/tax";
import {
  buildForm16A,
  financialYear,
  maskPan,
  summariseByQuarter,
  TDS_RATE,
  TDS_THRESHOLD,
  GST_RATE,
} from "@/lib/tax/engine";

export const metadata = { title: "Tax & TDS" };

// Demo rows model a high-earning senior who crossed the 194-O threshold;
// TDS = 0.1% of the gross order value (studentGross / 0.85).
const FY_EVENTS = [
  { order: "SV-1021", studentGross: 4250, tdsWithheld: 5, date: "2026-05-15" },
  { order: "SV-0998", studentGross: 6800, tdsWithheld: 8, date: "2026-04-22" },
  { order: "SV-0942", studentGross: 3200, tdsWithheld: 4, date: "2026-03-30" },
];

export default async function TaxPage({
  searchParams,
}: {
  searchParams: Promise<{ pan?: string }>;
}) {
  const me = currentStudent();
  const { pan } = await searchParams;

  const hasPan = pan !== "invalid";
  const panMasked = maskPan("ABCPM1234K");
  const fy = financialYear();

  const totalGross = FY_EVENTS.reduce((s, e) => s + e.studentGross, 0);
  const totalTds = FY_EVENTS.reduce((s, e) => s + e.tdsWithheld, 0);
  const form16a = buildForm16A({
    studentName: me.fullName,
    panMasked,
    events: FY_EVENTS,
  });

  return (
    <>
      <PageHeader
        eyebrow="Compliance"
        title="Tax and TDS."
        subtitle={`Your India tax position for FY ${fy}. We handle GST and TDS so you do not have to.`}
      />

      {pan === "saved" && (
        <Card
          role="status"
          aria-live="polite"
          surface="flat"
          tint="sage"
          className="mb-6 flex items-center gap-2 text-sm text-[var(--color-sage-900)]"
        >
          <ShieldCheck className="h-4 w-4" />
          PAN saved and encrypted.
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat
          label={`Gross earned · FY ${fy}`}
          value={`Rs.${totalGross.toLocaleString("en-IN")}`}
          sub="before TDS"
          accent="ink"
        />
        <Stat
          label={`TDS withheld (${TDS_RATE * 100}%)`}
          value={`Rs.${totalTds.toLocaleString("en-IN")}`}
          sub="Sec. 194-O, deposited to IT dept"
          accent="orange"
        />
        <Stat
          label="Net received"
          value={`Rs.${(totalGross - totalTds).toLocaleString("en-IN")}`}
          sub="after TDS"
          accent="sage"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardTitle>How TDS works on Stuviora</CardTitle>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Under Section 194-O, {TDS_RATE * 100}% TDS is withheld on
              your earnings once your gross for the financial year crosses{" "}
              <span className="font-medium text-[var(--color-ink)]">
                <Money value={TDS_THRESHOLD} />
              </span>
              . We deposit it against your PAN and issue a Form 16A you can use when
              filing your return. Below the threshold, nothing is withheld.
            </p>
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
                <span>FY threshold</span>
                <span>
                  <Money value={totalGross} /> / <Money value={TDS_THRESHOLD} />
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--color-surface-warm)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-sage)] to-[var(--color-sage-deep)]"
                  style={{
                    width: `${Math.min(100, (totalGross / TDS_THRESHOLD) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
                {totalGross > TDS_THRESHOLD
                  ? "You are over the threshold. TDS applies on earnings this year."
                  : "Under the threshold. No TDS withheld yet."}
              </p>
            </div>
          </Card>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-medium text-[var(--color-ink)]">
                Quarterly summary (FY {fy})
              </h2>
              <Button
                href="/api/student/tax/export"
                variant="outline"
                size="sm"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
            <Card className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
              {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => {
                const quarterly = summariseByQuarter(FY_EVENTS);
                const data = quarterly[q];
                return (
                  <div
                    key={q}
                    className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-warm)] p-4"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                      {q}
                    </div>
                    <div className="mt-1 font-display text-lg font-medium tabular-nums text-[var(--color-ink)]">
                      <Money value={data.studentGross} compact />
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-ink-faint)]">
                      {data.ordersCount} order{data.ordersCount === 1 ? "" : "s"} ·
                      TDS <Money value={data.tdsWithheld} compact />
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>

          <div>
            <h2 className="mb-3 font-display text-xl font-medium text-[var(--color-ink)]">
              TDS deducted this year
            </h2>
            <Card className="divide-y divide-[var(--color-line)] p-0">
              {FY_EVENTS.map((e) => (
                <div
                  key={e.order}
                  className="flex items-center justify-between gap-4 px-6 py-4 text-sm"
                >
                  <div>
                    <div className="font-medium text-[var(--color-ink)]">
                      Order #{e.order}
                    </div>
                    <div className="text-xs text-[var(--color-ink-muted)]">
                      Gross <Money value={e.studentGross} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg tabular-nums text-[var(--color-danger-deep)]">
                      - <Money value={e.tdsWithheld} />
                    </div>
                    <div className="text-xs text-[var(--color-ink-faint)]">
                      TDS at {TDS_RATE * 100}%
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          <Card tint="warm">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-[var(--color-ink-muted)]" />
              <CardTitle>GST on platform fees</CardTitle>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Stuviora charges {Math.round(GST_RATE * 100)}% GST on its 15% platform
              fee, not on your earnings. It appears as a line item on each order&apos;s
              GST invoice, available from the order page. Your payout is unaffected
              by GST.
            </p>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <CardTitle>PAN on file</CardTitle>
            {hasPan ? (
              <>
                <div className="mt-4 flex items-center gap-2">
                  <Badge tone="sage">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </Badge>
                  <span className="font-mono text-sm text-[var(--color-ink)]">
                    {panMasked}
                  </span>
                </div>
                <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
                  Encrypted at rest (Supabase Vault). Required for compliant TDS.
                </p>
              </>
            ) : (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--color-danger-deep)]">
                <AlertTriangle className="h-3.5 w-3.5" />
                That PAN looked invalid. Format: ABCDE1234F.
              </p>
            )}
            <form action={savePan} className="mt-5 space-y-3">
              <Input
                name="pan"
                placeholder="ABCDE1234F"
                maxLength={10}
                className="font-mono uppercase"
              />
              <Button type="submit" variant="outline" className="w-full">
                {hasPan ? "Update PAN" : "Save PAN"}
              </Button>
            </form>
          </Card>

          <Card>
            <CardTitle>Form 16A</CardTitle>
            <p className="mt-1.5 text-sm text-[var(--color-ink-muted)]">
              TDS certificate for FY {form16a.financialYear}.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Deductor TAN" value={form16a.deductorTan} />
              <Row label="PAN" value={form16a.panMasked} />
              <Row label="Orders" value={String(form16a.ordersCount)} />
              <Row
                label="Gross paid"
                value={`Rs.${form16a.totalGross.toLocaleString("en-IN")}`}
              />
              <Row
                label="TDS deposited"
                value={`Rs.${form16a.totalTdsWithheld.toLocaleString("en-IN")}`}
                strong
              />
            </div>
            <Button variant="primary" className="mt-5 w-full">
              <Download className="h-4 w-4" /> Download Form 16A
            </Button>
            <p className="mt-3 flex items-center gap-1 text-xs text-[var(--color-ink-faint)]">
              <FileText className="h-3 w-3" /> Issued quarterly per IT department
              schedule.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[var(--color-ink-muted)]">{label}</span>
      <span
        className={
          strong
            ? "font-semibold text-[var(--color-ink)]"
            : "font-medium text-[var(--color-ink)]"
        }
      >
        {value}
      </span>
    </div>
  );
}
