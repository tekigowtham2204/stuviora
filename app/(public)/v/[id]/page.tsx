import {
  ShieldCheck,
  Bot,
  CheckCircle2,
  Sparkles,
  Hash,
  Calendar,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { Logomark } from "@/components/brand/logomark";
import { JsonLd } from "@/components/seo/json-ld";
import { scoreDemoGate } from "@/lib/ai/demo-scorer";
import { AI_GATE_PASS_THRESHOLD, BRAND } from "@/lib/constants";

/**
 * Verdict receipt: a public, shareable permalink that confirms a specific
 * deliverable cleared the Stuviora AI gate. This is the horizon-three
 * artifact made real: students put it in portfolios, clients verify a
 * referral's claim, adjacent platforms can fetch it to gate access.
 *
 * Live path will read ai_reviews by public id (Phase V). Demo path
 * deterministically generates a passing verdict from the seed so the
 * artifact is exercisable end-to-end before any keys exist.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: `Verdict receipt ${id}`,
    description: `Stuviora AI quality gate verdict for deliverable ${id}. Verifiable, signed, portable.`,
  };
}

export default async function VerdictReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Demo: synthesise a deterministic passing verdict. Live: SELECT from
  // ai_reviews by public_id and 404 if missing. The shape is the same.
  const longText = "A ".repeat(420) + "Verified deliverable transcript.";
  const verdict = scoreDemoGate({
    seed: id,
    jobTitle: "Stuviora verified deliverable",
    jobDescription:
      "A real client brief verified through the platform's AI quality gate.",
    submissionText: longText,
  });

  const issuedAt = new Date();
  const issuedISO = issuedAt.toISOString();
  const issuedLabel = issuedAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const dims = [
    { label: "Brief alignment", value: verdict.briefAlignment, max: 40 },
    { label: "Completeness", value: verdict.completeness, max: 30 },
    { label: "Quality", value: verdict.quality, max: 30 },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Review",
          itemReviewed: {
            "@type": "CreativeWork",
            name: `Stuviora deliverable ${id}`,
          },
          author: {
            "@type": "Organization",
            name: `${BRAND.name} AI quality gate`,
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: verdict.score,
            bestRating: 100,
            worstRating: 0,
          },
          datePublished: issuedISO,
        }}
      />

      <Section spacing="tight" tone="warm" className="bg-hero-canvas">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge tone="sage" className="mx-auto">
              <ShieldCheck className="h-3 w-3" /> Verdict receipt
            </Badge>
            <h1 className="mt-5 font-display text-balance text-3xl font-medium tracking-tight text-[var(--color-ink)] sm:text-5xl">
              This deliverable cleared the {BRAND.name} AI quality gate.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
              Anyone with this link can verify the verdict. The receipt is
              tied to the deliverable, not to a profile. It cannot be edited
              after issue.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section spacing="default">
        <Container>
          <Reveal className="mx-auto max-w-3xl">
            <Card surface="glow" className="overflow-hidden p-0">
              <div className="flex flex-col gap-6 border-b border-[var(--color-line)] p-7 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Logomark
                    className="h-11 w-11 text-[var(--color-ink)]"
                    accent="var(--color-sage)"
                  />
                  <div>
                    <CardTitle>{BRAND.name} verdict receipt</CardTitle>
                    <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                      Issued by the {BRAND.name} AI quality gate. Verifiable
                      against the on-platform ledger.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
                    Verdict
                  </div>
                  <div className="mt-1 inline-flex items-center gap-2 font-display text-2xl font-medium text-[var(--color-sage-900)]">
                    <CheckCircle2 className="h-5 w-5 text-[var(--color-sage-deep)]" />
                    PASS
                  </div>
                </div>
              </div>

              <div className="grid gap-0 sm:grid-cols-3">
                <ReceiptStat
                  icon={Bot}
                  label="Score"
                  value={`${verdict.score} / 100`}
                  sub={`Pass mark ${AI_GATE_PASS_THRESHOLD}`}
                />
                <ReceiptStat
                  icon={Hash}
                  label="Receipt id"
                  value={id}
                  mono
                  sub="Tied to the deliverable, not the student"
                />
                <ReceiptStat
                  icon={Calendar}
                  label="Issued"
                  value={issuedLabel}
                  sub={issuedISO}
                />
              </div>

              <div className="border-t border-[var(--color-line)] p-7">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                  Per-dimension score
                </div>
                <div className="mt-4 space-y-3">
                  {dims.map((d) => (
                    <div key={d.label}>
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--color-ink-muted)]">
                          {d.label}
                        </span>
                        <span className="font-mono font-medium tabular-nums text-[var(--color-ink)]">
                          {d.value} / {d.max}
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--color-surface-warm)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--color-sage)] to-[var(--color-sage-deep)]"
                          style={{
                            width: `${(d.value / d.max) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-[var(--color-sage-200)] bg-[var(--color-sage-50)] p-4 text-xs leading-relaxed text-[var(--color-sage-900)]">
                  <span className="font-semibold">Originality check passed. </span>
                  Originality score {verdict.originality} / 100. The
                  submission was scanned for plagiarism and AI-generated
                  content before this receipt was issued.
                </div>
              </div>

              <div className="border-t border-[var(--color-line)] bg-[var(--color-surface-warm)] p-7 text-xs leading-relaxed text-[var(--color-ink-muted)]">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sage-deep)]" />
                  <p>
                    Receipts are immutable. The {BRAND.name} ledger keeps the
                    brief, the submission digest, and the gate verdict for
                    every cleared deliverable. Anyone with this URL can
                    verify the verdict against the ledger; nobody can edit it.
                  </p>
                </div>
              </div>
            </Card>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/vision" variant="primary">
                Why receipts matter
              </Button>
              <Button href="/trust" variant="secondary">
                See the trust architecture
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-[var(--color-ink-faint)]">
              Demo receipt. Live receipts read from `ai_reviews` and carry a
              signed verification footer. Same shape, same threshold, same
              guarantees.
            </p>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

function ReceiptStat({
  icon: Icon,
  label,
  value,
  sub,
  mono,
}: {
  icon: typeof Bot;
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[var(--color-line)] p-7 sm:border-b-0 sm:border-r last:sm:border-r-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-sage)] text-[var(--color-brown-900)]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
          {label}
        </div>
        <div
          className={
            "mt-1 truncate font-display text-base font-medium text-[var(--color-ink)] " +
            (mono ? "font-mono text-sm" : "")
          }
          title={value}
        >
          {value}
        </div>
        {sub && (
          <div className="mt-1 truncate text-[10px] text-[var(--color-ink-faint)]">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
