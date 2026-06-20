import { IncomeCalculator } from "@/components/feature/income-calculator";
import {
  ShieldCheck,
  Bot,
  Wallet,
  ArrowRight,
  GraduationCap,
  Building2,
  Sparkles,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Section,
  SectionEyebrow,
  SectionTitle,
  SectionLede,
} from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { Logomark } from "@/components/brand/logomark";
import { compactINR } from "@/components/ui/money";
import { JsonLd } from "@/components/seo/json-ld";
import { getPlatformMetrics } from "@/lib/data/queries";
import { services } from "@/lib/env";
import {
  COMMISSION_RATE,
  AI_GATE_PASS_THRESHOLD,
  ESCROW_AUTO_RELEASE_HOURS,
  TRUST_LAYERS,
} from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Stuviora",
          url: "https://stuviora.com",
          description:
            "India's AI-powered student freelancing marketplace. Every deliverable passes an AI quality check before it reaches the client.",
          areaServed: "IN",
          knowsAbout: [
            "student freelancing",
            "AI quality review",
            "escrow payments",
          ],
        }}
      />
      <Hero />
      <ProofStrip />
      <Section spacing="tight">
        <Container>
          <IncomeCalculator />
        </Container>
      </Section>
      <Moat />
      <Loop />
      <RealWins />
      <TrustPillars />
      <ClosingCta />
    </>
  );
}

// =============================================================================
// 1. Hero - anchor with the deal flow (mechanism, no fabricated instance)
// =============================================================================

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-hero-canvas">
        <div className="aurora" />
        <Container className="relative px-4 pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pb-32 lg:pt-28">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)]/80 px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-sage)] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-sage-deep)]" />
                </span>
                India&apos;s first AI-verified student marketplace
              </div>

              <h1 className="mt-7 font-display text-balance text-5xl font-medium leading-[1.02] tracking-tight text-[var(--color-ink)] sm:text-6xl lg:text-[80px]">
                Hire students.
                <span className="block">
                  Trust the{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10">platform</span>
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-full bg-[var(--color-yellow)]/70"
                    />
                  </span>
                  .
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-[var(--color-ink-muted)]">
                Every deliverable passes an AI quality check before it
                reaches you. Escrow-protected. College-verified. Built so
                first-time clients can hire first-time students with confidence.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button href="/auth/signup/student" size="lg" variant="primary">
                  <GraduationCap className="h-5 w-5" /> Earn as a student
                </Button>
                <Button
                  href="/auth/signup/client"
                  size="lg"
                  variant="secondary"
                >
                  <Building2 className="h-5 w-5" /> Hire student talent
                </Button>
              </div>

              {/* Inline reassurance row */}
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--color-ink-muted)]">
                {[
                  "Razorpay escrow",
                  "AI quality gate",
                  "72h auto-release",
                  "College-verified students",
                ].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-sage-deep)]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT - how a deal flows (mechanism, not a fabricated order) */}
            <div className="relative">
              <DealFlowCard />
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

function DealFlowCard() {
  const studentSharePct = Math.round((1 - COMMISSION_RATE) * 100);
  const platformPct = Math.round(COMMISSION_RATE * 100);
  const flow: {
    icon: LucideIcon;
    title: string;
    body: string;
    accent: "sage" | "yellow" | "orange";
  }[] = [
    {
      icon: ShieldCheck,
      accent: "sage",
      title: "Client funds escrow",
      body: "Razorpay holds the full amount upfront, before any work begins.",
    },
    {
      icon: GraduationCap,
      accent: "yellow",
      title: "Verified student delivers",
      body: "A college-verified student submits the work against the brief.",
    },
    {
      icon: Bot,
      accent: "orange",
      title: "AI quality gate",
      body: `Every submission is scored to 100. Only work at ${AI_GATE_PASS_THRESHOLD} or above reaches the client.`,
    },
    {
      icon: Wallet,
      accent: "sage",
      title: "Paid on approval",
      body: `${studentSharePct}% releases to the student on approval, or after ${ESCROW_AUTO_RELEASE_HOURS}h auto-release.`,
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-md">
      <Reveal>
        <Card surface="glow" className="relative z-10 rounded-[28px] p-7">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
            How every deal works
          </div>

          <ol className="mt-5 space-y-4">
            {flow.map(({ icon: Icon, title, body, accent }) => (
              <li key={title} className="flex items-start gap-3">
                <span
                  className={
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--color-brown-900)] " +
                    (accent === "sage"
                      ? "bg-[var(--color-sage)]"
                      : accent === "yellow"
                      ? "bg-[var(--color-yellow)]"
                      : "bg-[var(--color-orange)]")
                  }
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--color-ink)]">
                    {title}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-ink-muted)]">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* The split - policy facts, not a fabricated order */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-[var(--color-surface-warm)] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                Student receives
              </div>
              <div className="mt-1 font-display text-xl font-medium tabular-nums text-[var(--color-ink)]">
                {studentSharePct}%
              </div>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface-warm)] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                Platform fee
              </div>
              <div className="mt-1 font-display text-xl font-medium tabular-nums text-[var(--color-ink)]">
                {platformPct}%
              </div>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Floating: AI-reviewed badge */}
      <div className="absolute -right-3 -top-4 z-20 rotate-[4deg]">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] shadow-[var(--shadow-card)]">
          <Sparkles className="h-3.5 w-3.5 text-[var(--color-orange)]" />
          AI-reviewed
        </div>
      </div>

      {/* Floating: escrow pill */}
      <div className="absolute -bottom-6 -left-6 z-20 -rotate-[3deg]">
        <Card surface="raised" className="px-4 py-3" tint="white">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-sage)] text-[var(--color-brown-900)]">
              <Wallet className="h-3.5 w-3.5" />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                Razorpay escrow
              </div>
              <div className="font-display text-base font-medium text-[var(--color-ink)]">
                Paid on approval
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
// 2. Proof strip - the platform's pulse, in numbers
// =============================================================================

async function ProofStrip() {
  // Honesty rule: every NUMBER here is gated behind real, non-zero platform
  // metrics (live mode only). Until there is real traction, we show only true
  // facts about how the platform works, never invented social proof.
  const m = await getPlatformMetrics();
  const studentSharePct = Math.round((1 - COMMISSION_RATE) * 100);

  const realStats: { value: string; label: string }[] = services.supabase
    ? [
        m.gmv > 0 ? { value: compactINR(m.gmv), label: "processed in escrow" } : null,
        m.students > 0
          ? { value: m.students.toLocaleString("en-IN"), label: "students verified" }
          : null,
        m.clients > 0
          ? { value: m.clients.toLocaleString("en-IN"), label: "businesses hiring" }
          : null,
        m.activeOrders > 0
          ? { value: m.activeOrders.toLocaleString("en-IN"), label: "live orders" }
          : null,
      ].filter((s): s is { value: string; label: string } => s !== null)
    : [];

  // True statements about the model: shown until real metrics exist.
  const guarantees = [
    { value: `${studentSharePct}%`, label: "goes to the student" },
    { value: "100%", label: "escrow-protected" },
    { value: "AI", label: "checked before delivery" },
    { value: "72h", label: "auto-release safety net" },
  ];

  const stats = realStats.length >= 2 ? realStats.slice(0, 4) : guarantees;
  return (
    <Section spacing="tight" tone="warm">
      <Container>
        <div className="grid grid-cols-2 gap-y-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} index={i}>
              <div className="text-center">
                <div className="font-display text-4xl font-medium tabular-nums text-[var(--color-ink)] sm:text-5xl">
                  {s.value}
                </div>
                <div className="mt-1.5 text-xs uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// =============================================================================
// 3. The moat - AI quality gate, with the live scoring panel
// =============================================================================

function Moat() {
  const points: { icon: LucideIcon; text: string }[] = [
    { icon: CheckCircle2, text: "Scored 0 to 100 against the original brief" },
    {
      icon: ShieldCheck,
      text: "Only work above 70 is delivered, with an AI-reviewed badge",
    },
    {
      icon: Sparkles,
      text: "Below threshold: specific fixes, then resubmit (max 3 revisions)",
    },
    {
      icon: Bot,
      text: "Originality and AI-content detection keep the work genuinely the student's",
    },
  ];

  return (
    <Section spacing="generous">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
          <Reveal>
            <SectionEyebrow>The moat</SectionEyebrow>
            <SectionTitle>An AI quality gate on every delivery.</SectionTitle>
            <SectionLede>
              Student talent has always been a gamble. We remove it: our AI
              reviews every submission for completeness, brief alignment, and
              originality before the client sees it. Only work that clears the
              bar is delivered.
            </SectionLede>

            <ul className="mt-8 space-y-4">
              {points.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-sage)] text-[var(--color-brown-900)]">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[var(--color-ink)]">{text}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal index={1}>
            <GateRubricCard />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function GateRubricCard() {
  // The real rubric (lib/ai/quality-gate.ts): brief alignment is weighted /40,
  // completeness and quality /30 each (sum 100). Originality is a separate
  // plagiarism / AI-content check. We show the rubric itself, not a fabricated
  // score for an order that never happened.
  const dimensions = [
    { label: "Brief alignment", weight: 40 },
    { label: "Completeness", weight: 30 },
    { label: "Quality", weight: 30 },
  ];
  return (
    <Card className="relative overflow-hidden p-7" surface="glow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-sage)] text-[var(--color-brown-900)]">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold text-[var(--color-ink)]">
              What the AI gate checks
            </div>
            <div className="text-xs text-[var(--color-ink-faint)]">
              Scored on every delivery
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
            Pass mark
          </div>
          <div className="font-display text-4xl font-medium tabular-nums text-[var(--color-ink)]">
            {AI_GATE_PASS_THRESHOLD}
            <span className="ml-1 text-xs font-normal text-[var(--color-ink-faint)]">
              / 100
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {dimensions.map((d) => (
          <div key={d.label}>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--color-ink-muted)]">{d.label}</span>
              <span className="font-mono font-medium tabular-nums text-[var(--color-ink)]">
                weighted /{d.weight}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-surface-warm)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-sage)] to-[var(--color-sage-deep)]"
                style={{ width: `${d.weight}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--color-sage-200)] bg-[var(--color-sage-50)] p-4 text-xs leading-relaxed text-[var(--color-sage-900)]">
        <span className="font-semibold">Plus an originality check. </span>
        Submissions are scanned for plagiarism and AI-generated content, so the
        work stays genuinely the student&apos;s. Anything below{" "}
        {AI_GATE_PASS_THRESHOLD} bounces back with specific fixes.
      </div>
    </Card>
  );
}

// =============================================================================
// 4. The loop - three beats
// =============================================================================

function Loop() {
  const steps = [
    {
      n: "01",
      icon: ShieldCheck,
      title: "Post and fund",
      body: "Client posts a job, funds Razorpay escrow upfront. Funds are locked. Safe to proceed.",
      accent: "sage" as const,
    },
    {
      n: "02",
      icon: Bot,
      title: "Build and AI-review",
      body: "Verified student delivers. Our AI scores the work against the brief. Only passing work reaches the client.",
      accent: "yellow" as const,
    },
    {
      n: "03",
      icon: Wallet,
      title: "Approve and split",
      body: "Client approves, or auto-release after 72 hours. Split settles instantly: 85% student, 15% platform.",
      accent: "orange" as const,
    },
  ];
  return (
    <Section spacing="generous" tone="warm">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionEyebrow>The loop</SectionEyebrow>
          <SectionTitle>One safe loop. Every time. No exceptions.</SectionTitle>
          <SectionLede className="mx-auto">
            Clients pay into escrow. Students do the work. AI verifies it before
            delivery. Money releases on approval.
          </SectionLede>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.n} index={i}>
              <Card className="group relative h-full overflow-hidden p-7">
                <span className="font-display text-xs text-[var(--color-ink-faint)]">
                  {step.n}
                </span>
                <span
                  className={
                    "mt-5 flex h-12 w-12 items-center justify-center rounded-2xl " +
                    (step.accent === "sage"
                      ? "bg-[var(--color-sage)] text-[var(--color-brown-900)]"
                      : step.accent === "yellow"
                      ? "bg-[var(--color-yellow)] text-[var(--color-brown-900)]"
                      : "bg-[var(--color-orange)] text-[var(--color-brown-900)]")
                  }
                >
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-xl font-medium text-[var(--color-ink)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  {step.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// =============================================================================
// 5. Real wins - three student stories
// =============================================================================

function RealWins() {
  // Honest "how payouts work" framing. No fabricated testimonials: every
  // claim below is a true statement about the platform's guarantees.
  const steps = [
    {
      icon: Bot,
      accent: "sage" as const,
      title: "Passes the AI gate first",
      body: "Every deliverable is scored against the original brief before the client sees it. Below the bar, it bounces back to the student with specific fixes, not a rejection.",
    },
    {
      icon: ShieldCheck,
      accent: "yellow" as const,
      title: "Backed by funded escrow",
      body: "The client funds Razorpay escrow the moment they hire. The student starts knowing the money is already there, so nobody gets ghosted.",
    },
    {
      icon: Wallet,
      accent: "orange" as const,
      title: "Released on approval",
      body: "The student gets 85% on client approval, with a 72-hour auto-release safety net so payment never stalls if the client goes quiet.",
    },
  ];

  return (
    <Section spacing="generous">
      <Container>
        <Reveal className="max-w-2xl">
          <SectionEyebrow>How payouts work</SectionEyebrow>
          <SectionTitle>Every rupee is earned, then released.</SectionTitle>
          <SectionLede>
            No payout happens until the work clears the AI gate and the client
            approves. Here is exactly what stands behind every delivery.
          </SectionLede>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} index={i}>
              <Card className="flex h-full flex-col p-6">
                <span
                  className={
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[var(--color-brown-900)] " +
                    (s.accent === "sage"
                      ? "bg-[var(--color-sage)]"
                      : s.accent === "yellow"
                      ? "bg-[var(--color-yellow)]"
                      : "bg-[var(--color-orange)]")
                  }
                >
                  <s.icon className="h-5 w-5" />
                </span>
                <div className="mt-5 font-display text-lg font-medium text-[var(--color-ink)]">
                  {s.title}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  {s.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button href="/explore" variant="secondary">
            Browse verified students <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Container>
    </Section>
  );
}

// =============================================================================
// 6. Trust pillars - compact 5-layer grid
// =============================================================================

function TrustPillars() {
  return (
    <Section spacing="generous" tone="warm" className="relative overflow-hidden">
      <div className="aurora opacity-50" />
      <Container className="relative">
        <Reveal className="max-w-2xl">
          <SectionEyebrow>Trust architecture</SectionEyebrow>
          <SectionTitle>Five layers of trust, stacked.</SectionTitle>
          <SectionLede>
            Trust is not one problem. It is five. We solve all of them so a
            first-time client can hire a first-time student with confidence.
          </SectionLede>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {TRUST_LAYERS.map((layer, i) => (
            <Reveal key={layer.n} index={i}>
              <Card
                surface="raised"
                className={
                  "h-full " +
                  (layer.moat
                    ? "ring-2 ring-[var(--color-sage)] ring-offset-2 ring-offset-[var(--color-surface-warm)]"
                    : "")
                }
              >
                <div className="flex items-center gap-2">
                  <span className="font-display flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brown)] text-sm font-medium text-[var(--color-cream)]">
                    {layer.n}
                  </span>
                  {layer.moat && (
                    <Badge tone="sage">
                      <Sparkles className="h-3 w-3" /> Moat
                    </Badge>
                  )}
                </div>
                <h3 className="mt-4 font-display text-base font-medium text-[var(--color-ink)]">
                  {layer.title}
                </h3>
                <p className="mt-1 text-xs font-medium italic text-[var(--color-ink-muted)]">
                  {layer.q}
                </p>
                <p className="mt-2.5 text-xs leading-relaxed text-[var(--color-ink-muted)]">
                  {layer.desc}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// =============================================================================
// 7. Closing CTA - brown, with concrete claim
// =============================================================================

function ClosingCta() {
  return (
    <Section spacing="generous">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] bg-[var(--color-brown)] px-8 py-20 text-[var(--color-cream)] sm:px-14 sm:py-24 dark:border dark:border-white/10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(50% 60% at 30% 0%, rgba(171,194,112,0.35) 0%, transparent 60%), radial-gradient(45% 45% at 80% 100%, rgba(253,167,105,0.35) 0%, transparent 60%)",
              }}
            />
            <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <Logomark
                  className="h-12 w-12 text-[var(--color-cream)]"
                  accent="var(--color-sage)"
                />
                <h2 className="mt-6 font-display text-balance text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl">
                  Your skills are already worth money.
                </h2>
                <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-[var(--color-cream)]/80 sm:text-lg">
                  Students keep {Math.round((1 - COMMISSION_RATE) * 100)}%, get
                  paid safely, and build a portfolio with every job. Clients
                  stop gambling on first-time talent. Everyone wins, by
                  construction.
                </p>
                <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row">
                  <Button
                    href="/auth/signup/student"
                    size="lg"
                    variant="primary"
                  >
                    Create your free profile <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    href="/auth/signup/client"
                    size="lg"
                    variant="ghost"
                    className="text-[var(--color-cream)] hover:bg-white/10"
                  >
                    I&apos;m hiring instead
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                <ClosingStat label="Student share" value="85%" />
                <ClosingStat label="Min payout" value="₹100" />
                <ClosingStat label="Auto-release window" value="72h" />
                <ClosingStat label="Commission GST handled" value="18%" />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

function ClosingStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-cream)]/60">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-medium tabular-nums text-[var(--color-cream)] sm:text-3xl">
        {value}
      </div>
    </div>
  );
}
