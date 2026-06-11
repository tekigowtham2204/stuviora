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
  Quote,
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
import { TrustTierBadge } from "@/components/ui/trust-tier-badge";
import { COMMISSION_RATE, TRUST_LAYERS } from "@/lib/constants";

export default function HomePage() {
  return (
    <>
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
// 1. Hero - anchor with a live deal in progress
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
                Every deliverable passes a Claude AI quality check before it
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
                  "Claude AI quality gate",
                  "72h auto-release",
                  "500+ verified colleges",
                ].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-sage-deep)]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT - live deal in progress */}
            <div className="relative">
              <LiveDealCard />
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

function LiveDealCard() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* The deal card */}
      <Reveal>
        <Card surface="glow" className="relative z-10 rounded-[28px] p-7">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
              Order SV-1042 · in progress
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-sage-50)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-sage-900)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-sage-deep)]" />
              Live
            </span>
          </div>

          {/* Student row */}
          <div className="mt-5 flex items-start gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-sage)] text-lg font-semibold text-[var(--color-brown-900)]">
              KR
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg font-medium text-[var(--color-ink)]">
                  Kabir Rao
                </span>
                <ShieldCheck className="h-4 w-4 text-[var(--color-sage-deep)]" />
              </div>
              <div className="text-xs text-[var(--color-ink-muted)]">
                NID Ahmedabad · Communication Design
              </div>
            </div>
            <TrustTierBadge tier="platinum" size="sm" />
          </div>

          <p className="mt-5 text-sm leading-relaxed text-[var(--color-ink)]">
            Delivered: Instagram content kit for a coffee brand. 10 posts and 3
            reel covers.
          </p>

          {/* AI review readout */}
          <div className="mt-5 rounded-2xl border border-[var(--color-sage-200)] bg-[var(--color-sage-50)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-sage-900)]">
                <Bot className="h-3.5 w-3.5" /> AI quality gate
              </div>
              <div className="font-display text-2xl font-medium tabular-nums text-[var(--color-ink)]">
                86
                <span className="ml-1 text-xs font-normal text-[var(--color-ink-faint)]">
                  / 100
                </span>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-sage)] to-[var(--color-sage-deep)]"
                style={{ width: "86%" }}
              />
            </div>
            <div className="mt-2 text-[11px] text-[var(--color-sage-900)]/80">
              PASS. Safe to deliver.
            </div>
          </div>

          {/* Split */}
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-[var(--color-surface-warm)] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                Student receives
              </div>
              <div className="mt-1 font-display text-xl font-medium tabular-nums text-[var(--color-ink)]">
                ₹5,950
              </div>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface-warm)] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                Platform fee (15%)
              </div>
              <div className="mt-1 font-display text-xl font-medium tabular-nums text-[var(--color-ink)]">
                ₹1,050
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

      {/* Floating: payout pill */}
      <div className="absolute -bottom-6 -left-6 z-20 -rotate-[3deg]">
        <Card surface="raised" className="px-4 py-3" tint="white">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-sage)] text-[var(--color-brown-900)]">
              <Wallet className="h-3.5 w-3.5" />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                Razorpay payout
              </div>
              <div className="font-display text-base font-medium tabular-nums text-[var(--color-ink)]">
                ₹5,950 credited
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

function ProofStrip() {
  const stats = [
    { value: "₹12L+", label: "paid to students" },
    { value: "500+", label: "verified colleges" },
    { value: "91%", label: "AI-gate first-pass" },
    { value: "4.8 / 5", label: "client rating" },
  ];
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
              Student talent has always been a gamble. We remove it: Claude
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
            <ReviewPanel />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function ReviewPanel() {
  const scores = [
    { label: "Brief alignment", value: 36, max: 40 },
    { label: "Completeness", value: 27, max: 30 },
    { label: "Quality", value: 23, max: 30 },
    { label: "Originality", value: 96, max: 100 },
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
              AI quality review
            </div>
            <div className="font-mono text-xs text-[var(--color-ink-faint)]">
              order SV-1042
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
            Score
          </div>
          <div className="font-display text-4xl font-medium tabular-nums text-[var(--color-ink)]">
            86
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {scores.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--color-ink-muted)]">{s.label}</span>
              <span className="font-mono font-medium tabular-nums text-[var(--color-ink)]">
                {s.value}/{s.max}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-surface-warm)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-sage)] to-[var(--color-sage-deep)]"
                style={{ width: `${(s.value / s.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--color-sage-200)] bg-[var(--color-sage-50)] p-4 text-xs leading-relaxed text-[var(--color-sage-900)]">
        <span className="font-semibold">PASS. </span>
        Deliverable matches the brief and reads cleanly. Minor: tighten the
        intro. Safe to deliver.
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
      body: "Verified student delivers. Claude scores the work against the brief. Only passing work reaches the client.",
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
  const wins = [
    {
      avatar: "DS",
      name: "Diya Sharma",
      college: "LSR · Delhi",
      project: "4 SaaS onboarding blog posts",
      payout: "₹8,500",
      quote:
        "Got hired in 3 hours, paid the day after delivery. Cleaner than any other gig site I tried.",
      accent: "yellow" as const,
      tier: "silver" as const,
    },
    {
      avatar: "AM",
      name: "Aarav Mehta",
      college: "IIT Bombay",
      project: "Python script to dedupe a CRM export",
      payout: "₹5,100",
      quote:
        "AI gate caught a missing edge case before the client saw it. Saved me a revision round.",
      accent: "sage" as const,
      tier: "gold" as const,
    },
    {
      avatar: "KR",
      name: "Kabir Rao",
      college: "NID · Ahmedabad",
      project: "Coffee brand Instagram kit",
      payout: "₹5,950",
      quote:
        "First job here got me a Platinum tier in a month. Repeat clients found me, not the other way.",
      accent: "orange" as const,
      tier: "platinum" as const,
    },
  ];

  return (
    <Section spacing="generous">
      <Container>
        <Reveal className="max-w-2xl">
          <SectionEyebrow>Real wins</SectionEyebrow>
          <SectionTitle>Students paid this week.</SectionTitle>
          <SectionLede>
            Every payout is escrow-released only after a passing AI review and a
            client approval. Real names, real money.
          </SectionLede>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {wins.map((w, i) => (
            <Reveal key={w.name} index={i}>
              <Card className="flex h-full flex-col p-6">
                <div className="flex items-start gap-3">
                  <span
                    className={
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-[var(--color-brown-900)] " +
                      (w.accent === "sage"
                        ? "bg-[var(--color-sage)]"
                        : w.accent === "yellow"
                        ? "bg-[var(--color-yellow)]"
                        : "bg-[var(--color-orange)]")
                    }
                  >
                    {w.avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-base font-medium text-[var(--color-ink)]">
                      {w.name}
                    </div>
                    <div className="text-xs text-[var(--color-ink-muted)]">
                      {w.college}
                    </div>
                  </div>
                  <TrustTierBadge tier={w.tier} size="sm" />
                </div>

                <Quote className="mt-5 h-4 w-4 text-[var(--color-ink-faint)]" />
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-[var(--color-ink)]">
                  {w.quote}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-[var(--color-line)] pt-4">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                      Project
                    </div>
                    <div className="truncate text-xs font-medium text-[var(--color-ink)]">
                      {w.project}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                      Paid
                    </div>
                    <div className="font-display text-base font-medium tabular-nums text-[var(--color-ink)]">
                      {w.payout}
                    </div>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button href="/explore" variant="secondary">
            See more verified students <ArrowRight className="h-4 w-4" />
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
          <div className="relative overflow-hidden rounded-[36px] bg-[var(--color-brown)] px-8 py-20 text-[var(--color-cream)] sm:px-14 sm:py-24">
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
                <ClosingStat label="AI-gate pass rate" value="91%" />
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
