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
import * as demo from "@/lib/demo/data";
import { AI_GATE_PASS_THRESHOLD } from "@/lib/constants";

export const metadata = {
  title: "Trust, in numbers",
  description:
    "How Stuviora keeps both sides safe: escrow-protected payments, an AI quality gate on every delivery, and verified students. The numbers, published.",
};

export default function TrustPage() {
  const m = demo.platformMetrics;

  // Mirrors the landing-page proof strip; wire to live metrics post-launch.
  const stats = [
    { label: "AI-gate first-pass rate", value: "91%" },
    { label: "Paid to students", value: `Rs.${(m.gmv / 100000).toFixed(0)}L+` },
    { label: "Verified colleges", value: "500+" },
    { label: "Double payouts, ever", value: "0" },
  ];

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
      title: "Escrow-protected money",
      body: "Clients fund escrow before work starts, so students cannot be ghosted. Students are paid 85% on approval, with automatic release in 72 hours if the client goes quiet.",
    },
    {
      icon: Scale,
      title: "Fair disputes",
      body: "If the two sides disagree, funds stay locked while both submit evidence. Decisions can be appealed within 7 days. Our daily reconciler guards a hard rule: zero double payouts, ever.",
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
