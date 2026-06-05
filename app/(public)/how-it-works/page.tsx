import {
  ShieldCheck,
  Bot,
  Wallet,
  GraduationCap,
  Building2,
  BadgeCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Section,
  SectionEyebrow,
  SectionTitle,
  SectionLede,
} from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { TRUST_LAYERS } from "@/lib/constants";

export const metadata = {
  title: "How it works",
  description:
    "A guided walkthrough of how Stuviora works for students and clients, from signup to AI-reviewed delivery and escrow-protected payout.",
};

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

const STUDENT_STEPS: Step[] = [
  {
    icon: GraduationCap,
    title: "Verify with your college email",
    body: "Sign up using your .ac.in or .edu.in email. We OTP-verify it against our domain registry, so clients know you are who you say you are.",
  },
  {
    icon: Bot,
    title: "Pass a 15-minute skill assessment",
    body: "Take a short AI-graded test in your stream. Combined with portfolio samples, this builds your skill score before you list a single service.",
  },
  {
    icon: BadgeCheck,
    title: "List services and bid on matched jobs",
    body: "Create service packages or apply to jobs with one-click AI proposal hints. Higher trust tiers unlock higher-budget jobs.",
  },
  {
    icon: Wallet,
    title: "Deliver, get paid",
    body: "Submit work, the AI gate reviews it, the client approves, and the 85% split lands in your wallet. Withdraw to UPI or bank when ready.",
  },
];

const CLIENT_STEPS: Step[] = [
  {
    icon: Building2,
    title: "Post a job, set your budget",
    body: "Describe what you need, add a budget range and deadline. The matching engine notifies the best-fit students within minutes.",
  },
  {
    icon: ShieldCheck,
    title: "Hire and fund escrow",
    body: "Review proposals ranked by trust and fit. Pick the student you like, fund Razorpay escrow, and work begins. Funds are locked, safe.",
  },
  {
    icon: Bot,
    title: "Receive AI-reviewed work",
    body: "Before delivery, every submission passes the AI quality gate for brief alignment, completeness, originality, and polish. You only see passing work.",
  },
  {
    icon: BadgeCheck,
    title: "Approve, or 72-hour auto-release",
    body: "Approve to release payment to the student. Do not respond? Auto-release after 72 hours. Have a problem? Open a dispute, we mediate.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Section spacing="tight" tone="cream" className="bg-hero-canvas">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>How Stuviora works</SectionEyebrow>
            <SectionTitle as="h1" className="mt-4 sm:text-5xl">
              One safe loop, from signup to settled payout.
            </SectionTitle>
            <SectionLede className="mx-auto">
              Two sides, same loop. Both protected by escrow, both held to the same
              AI-reviewed quality standard.
            </SectionLede>
          </Reveal>
        </Container>
      </Section>

      {/* Student path */}
      <PathSection
        accent="sage"
        eyebrow="For students"
        title="Your skills are worth money. We make them safe to sell."
        body="Get verified, get matched, get paid. We remove the scary parts so you can focus on the work itself."
        cta={{ href: "/auth/signup/student", label: "Start earning" }}
        steps={STUDENT_STEPS}
      />

      {/* Client path */}
      <PathSection
        accent="orange"
        eyebrow="For clients"
        title="Hire student talent without rolling the dice."
        body="Every deliverable passes an AI quality check before it reaches you. Pay only on approval, with a first-job money-back guarantee."
        cta={{ href: "/auth/signup/client", label: "Hire talent" }}
        steps={CLIENT_STEPS}
        tone="warm"
      />

      {/* Trust architecture */}
      <Section spacing="default">
        <Container>
          <Reveal className="max-w-2xl">
            <SectionEyebrow>Why it&apos;s safe</SectionEyebrow>
            <SectionTitle>Five layers of trust.</SectionTitle>
            <SectionLede>
              Trust is not one problem. It is five. Stuviora solves all five so a
              first-time client can hire a first-time student with confidence.
            </SectionLede>
          </Reveal>
          <ol className="mt-12 grid gap-4 md:grid-cols-2">
            {TRUST_LAYERS.map((l, i) => (
              <Reveal key={l.n} index={i} as="li">
                <Card
                  className={
                    "h-full " +
                    (l.moat
                      ? "ring-2 ring-[var(--color-sage)] ring-offset-2 ring-offset-[var(--color-background)]"
                      : "")
                  }
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                    <span className="font-display flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-brown)] text-[var(--color-cream)]">
                      {l.n}
                    </span>
                    <span className="text-[var(--color-ink)]">{l.title}</span>
                    {l.moat && (
                      <Badge tone="sage" className="ml-auto">
                        <Sparkles className="h-3 w-3" /> The moat
                      </Badge>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-medium italic text-[var(--color-ink-muted)]">
                    {l.q}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                    {l.desc}
                  </p>
                </Card>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>
    </>
  );
}

function PathSection({
  accent,
  eyebrow,
  title,
  body,
  cta,
  steps,
  tone = "cream",
}: {
  accent: "sage" | "orange";
  eyebrow: string;
  title: string;
  body: string;
  cta: { href: string; label: string };
  steps: Step[];
  tone?: "cream" | "warm";
}) {
  return (
    <Section spacing="default" tone={tone}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          <div>
            <Badge tone={accent}>{eyebrow}</Badge>
            <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-[var(--color-ink)] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              {body}
            </p>
            <Button
              href={cta.href}
              variant={accent === "sage" ? "sage" : "primary"}
              className="mt-6"
            >
              {cta.label}
            </Button>
          </div>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <Reveal key={s.title} index={i} as="li">
                <Card className="flex items-start gap-4">
                  <span
                    className={
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl " +
                      (accent === "sage"
                        ? "bg-[var(--color-sage)] text-[var(--color-brown-900)]"
                        : "bg-[var(--color-orange)] text-[var(--color-brown-900)]")
                    }
                  >
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
                      Step {i + 1}
                    </div>
                    <h3 className="mt-1 font-display text-lg font-medium text-[var(--color-ink)]">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                      {s.body}
                    </p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
