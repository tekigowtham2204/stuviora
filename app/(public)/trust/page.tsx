import { ShieldCheck, Bot, Wallet, Scale } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Section,
  SectionEyebrow,
  SectionTitle,
  SectionLede,
} from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { compactINR } from "@/components/ui/money";
import { getPlatformMetrics } from "@/lib/data/queries";
import { services } from "@/lib/env";
import { AI_GATE_PASS_THRESHOLD } from "@/lib/constants";

export const metadata = {
  title: "Trust, in numbers",
  description:
    "How Stuviora keeps both sides safe: pay-on-delivery payments, an AI quality gate on every delivery, and verified students. The numbers we hold ourselves to.",
};

export default async function TrustPage() {
  const m = await getPlatformMetrics();

  // Honesty rule: the live traction numbers only appear once they are real
  // (live mode + non-zero). The policy guarantees below are always true, so
  // the page is never padded with invented metrics.
  const realStats: { label: string; value: string }[] = services.supabase
    ? [
        m.gmv > 0 ? { label: "Processed on delivery", value: compactINR(m.gmv) } : null,
        m.students > 0
          ? { label: "Students verified", value: m.students.toLocaleString("en-IN") }
          : null,
        m.clients > 0
          ? { label: "Businesses hiring", value: m.clients.toLocaleString("en-IN") }
          : null,
      ].filter((s): s is { label: string; value: string } => s !== null)
    : [];

  const guarantees = [
    { label: "AI-gate minimum score", value: `${AI_GATE_PASS_THRESHOLD}` },
    { label: "Student share of every order", value: "85%" },
    { label: "Dispute window", value: "72h" },
    { label: "Double payouts, ever", value: "0" },
  ];

  const stats = [...realStats, ...guarantees].slice(0, 4);

  const layers = [
    {
      icon: ShieldCheck,
      title: "Verified students",
      body: "Every freelancer signs up with a college email we verify by OTP against our domain registry. Clients always know they are hiring a real, enrolled student.",
    },
    {
      icon: Bot,
      title: "The AI quality gate",
      body: `Before a client sees any delivery, our AI scores it against the original brief from 0 to 100. Below ${AI_GATE_PASS_THRESHOLD} it goes back to the student with specific fixes. Weak work gets improved, not shipped.`,
    },
    {
      icon: Wallet,
      title: "Pay on delivery",
      body: "Clients authorize payment up front as a hold, so students cannot be ghosted, but are only charged when the AI gate passes the work. Students get 85%, settled after a 72-hour dispute window.",
    },
    {
      icon: Scale,
      title: "Automated, fair resolution",
      body: "Work that fails the gate is never charged for. A client who disputes inside the window is refunded while the student reworks it. No staff mediator, and our daily reconciler guards a hard rule: zero double payouts, ever.",
    },
  ];

  return (
    <>
      <Section spacing="tight" tone="warm">
        <Container>
          <SectionEyebrow>Trust, published</SectionEyebrow>
          <SectionTitle as="h1">The numbers behind the promise.</SectionTitle>
          <SectionLede>
            Hire students. Trust the platform. Here is exactly how the
            platform earns that trust, and the numbers we hold ourselves to.
          </SectionLede>
        </Container>
      </Section>

      <Section spacing="default">
        <Container>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.label} className="text-center">
                <div className="font-display text-3xl font-medium tabular-nums text-[var(--color-ink)]">
                  {s.value}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                  {s.label}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {layers.map((l) => (
              <Card key={l.title}>
                <div className="flex items-center gap-2">
                  <l.icon className="h-4 w-4 text-[var(--color-sage-deep)]" />
                  <CardTitle>{l.title}</CardTitle>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  {l.body}
                </p>
              </Card>
            ))}
          </div>

          <Card className="mt-10" tint="sage" surface="flat">
            <CardTitle>The gate gets smarter with every order</CardTitle>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Every AI review is logged and later compared against the human
              outcome: did the client approve, ask for changes, or dispute?
              That feedback loop continuously recalibrates the gate, so the
              quality check improves with every completed order on the
              platform.
            </p>
          </Card>

          <div className="mt-10 text-center">
            <Button href="/auth/signup" variant="primary">
              Experience it yourself
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
