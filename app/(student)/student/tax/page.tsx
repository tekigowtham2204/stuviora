import { Download, FileText, ShieldCheck, AlertTriangle, IndianRupee } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currentStudent } from "@/lib/auth/session";
import { savePan } from "@/app/actions/tax";
import {
  buildForm16A,
  financialYear,
  maskPan,
  TDS_RATE,
  TDS_THRESHOLD,
  GST_RATE,
} from "@/lib/tax/engine";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "Tax & TDS" };

// Demo: this student's TDS-eligible orders for the current financial year.
const FY_EVENTS = [
  { order: "SV-1021", studentGross: 4250, tdsWithheld: 212.5 },
  { order: "SV-0998", studentGross: 6800, tdsWithheld: 340 },
  { order: "SV-0942", studentGross: 3200, tdsWithheld: 160 },
];

export default async function TaxPage({
  searchParams,
}: {
  searchParams: Promise<{ pan?: string }>;
}) {
  const me = currentStudent();
  const { pan } = await searchParams;

  // Demo: assume PAN on file unless the user just submitted an invalid one.
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
        title="Tax & TDS"
        subtitle={`Your India tax position for FY ${fy}. We handle GST and TDS so you don't have to.`}
      />

      {pan === "saved" && (
        <Card className="mb-4 flex items-center gap-2 border-success/30 bg-success-bg/40 py-3">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span className="text-sm text-success">PAN saved and encrypted.</span>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label={`Gross earned · FY ${fy}`} value={formatINR(totalGross)} sub="before TDS" />
        <Stat label="TDS withheld (5%)" value={formatINR(totalTds)} sub="Sec. 194H, deposited to IT dept" />
        <Stat label="Net received" value={formatINR(totalGross - totalTds)} sub="after TDS" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* TDS explainer + threshold */}
          <Card>
            <CardTitle>How TDS works on Stuviora</CardTitle>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Under Section 194H, {Math.round(TDS_RATE * 100)}% TDS is withheld on your earnings
              once your gross for the financial year crosses{" "}
              <strong className="text-foreground">{formatINR(TDS_THRESHOLD)}</strong>. We deposit
              it against your PAN and issue a Form 16A you can use when filing your return. Below
              the threshold, nothing is withheld.
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>FY threshold</span>
                <span>
                  {formatINR(totalGross)} / {formatINR(TDS_THRESHOLD)}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-trust-500"
                  style={{ width: `${Math.min(100, (totalGross / TDS_THRESHOLD) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-subtle">
                {totalGross > TDS_THRESHOLD
                  ? "You're over the threshold — TDS applies on earnings this year."
                  : "Under the threshold — no TDS withheld yet."}
              </p>
            </div>
          </Card>

          {/* TDS per-order ledger */}
          <div>
            <CardTitle>TDS deducted this year</CardTitle>
            <Card className="mt-3 divide-y divide-border p-0">
              {FY_EVENTS.map((e) => (
                <div key={e.order} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <div className="font-medium">Order #{e.order}</div>
                    <div className="text-xs text-muted">Gross {formatINR(e.studentGross)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-danger">- {formatINR(e.tdsWithheld)}</div>
                    <div className="text-xs text-subtle">TDS @ 5%</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* GST note */}
          <Card className="bg-surface-muted">
            <div className="flex items-center gap-2 text-sm font-medium">
              <IndianRupee className="h-4 w-4 text-subtle" /> GST on platform fees
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Stuviora charges {Math.round(GST_RATE * 100)}% GST on its 15% platform fee, not on
              your earnings. It appears as a line item on each order&apos;s GST invoice, available
              from the order page. Your payout is unaffected by GST.
            </p>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          {/* PAN capture */}
          <Card>
            <CardTitle>PAN on file</CardTitle>
            {hasPan ? (
              <>
                <div className="mt-3 flex items-center gap-2">
                  <Badge tone="success">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </Badge>
                  <span className="font-mono text-sm">{panMasked}</span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  Encrypted at rest (Supabase Vault). Required for compliant TDS.
                </p>
              </>
            ) : (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-danger">
                <AlertTriangle className="h-3.5 w-3.5" /> That PAN looked invalid. Format:
                ABCDE1234F.
              </p>
            )}
            <form action={savePan} className="mt-4 space-y-2">
              <input
                name="pan"
                placeholder="ABCDE1234F"
                maxLength={10}
                className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-brand-400"
              />
              <Button type="submit" variant="outline" className="w-full">
                {hasPan ? "Update PAN" : "Save PAN"}
              </Button>
            </form>
          </Card>

          {/* Form 16A */}
          <Card>
            <CardTitle>Form 16A</CardTitle>
            <p className="mt-1 text-sm text-muted">TDS certificate for FY {form16a.financialYear}.</p>
            <div className="mt-3 space-y-1.5 text-sm">
              <Row label="Deductor TAN" value={form16a.deductorTan} />
              <Row label="PAN" value={form16a.panMasked} />
              <Row label="Orders" value={String(form16a.ordersCount)} />
              <Row label="Gross paid" value={formatINR(form16a.totalGross)} />
              <Row label="TDS deposited" value={formatINR(form16a.totalTdsWithheld)} strong />
            </div>
            <Button variant="primary" className="mt-4 w-full">
              <Download className="h-4 w-4" /> Download Form 16A
            </Button>
            <p className="mt-2 flex items-center gap-1 text-xs text-subtle">
              <FileText className="h-3 w-3" /> Issued quarterly per IT department schedule.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={strong ? "font-semibold text-foreground" : "font-medium"}>{value}</span>
    </div>
  );
}
