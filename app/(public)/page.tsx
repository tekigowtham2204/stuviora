import Link from "next/link";
import {
  ShieldCheck,
  Bot,
  Wallet,
  ArrowRight,
  GraduationCap,
  Building2,
  Sparkles,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section, SectionEyebrow, SectionTitle, SectionLede } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { Logomark } from "@/components/brand/logomark";
import { TrustTierBadge } from "@/components/ui/trust-tier-badge";
import {
  SERVICE_CATEGORIES,
  TRUST_LAYERS,
  COMMISSION_RATE,
} from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <WarmHero />
      <MoatSection />
      <LoopSection />
      <CategoriesSection />
      <TrustSection />
      <TalentTeasers />
      <ClosingCta />
    </>
  );
}

// =============================================================================
// Hero — warm-craft, no 3D
// =============================================================================

function WarmHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-hero-canvas">
        <div className="aurora" />
        <Container className="relative px-4 py-20 sm:py-28 lg:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            {/* LEFT: copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-sage-deep)]" />
                India&apos;s first AI-verified student marketplace
              </div>

              <h1 className="mt-7 font-display text-5xl font-medium leading-[1.02] tracking-tight text-balance text-[var(--color-ink)] sm:text-6xl lg:text-7xl">
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

              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[var(--color-ink-muted)] sm:text-lg">
                Every deliverable from a Stuviora student passes an AI quality
                check before it reaches you. Escrow-protected. College-verified.
                Built so first-time clients can hire first-time students with
                confidence.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button href="/auth/signup/student" size="lg" variant="primary">
                  <GraduationCap className="h-5 w-5" /> Earn as a student
                </Button>
                <Button href="/auth/signup/client" size="lg" variant="secondary">
                  <Building2 className="h-5 w-5" /> Hire student talent
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--color-ink-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-sage-deep)]" />
                  Razorpay escrow
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-sage-deep)]" />
                  AI quality gate
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-sage-deep)]" />
                  72h auto-release
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-sage-deep)]" />
                  500+ verified colleges
                </span>
              </div>
            </div>

            {/* RIGHT: hero card stack */}
            <div className="relative">
              <HeroCardStack />
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

function HeroCardStack() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Back: student profile card */}
      <Reveal>
        <Card className="relative z-10 rounded-[28px] p-7" surface="glow">
          <div className="flex items-start gap-3">
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
                Communication Design · NID Ahmedabad
              </div>
            </div>
            <TrustTierBadge tier="platinum" size="sm" />
          </div>

          <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
            Brand and social design that stops the scroll.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {["Figma", "Branding", "Social design", "Illustration"].map((t) => (
              <span
                key={t}
                className="rounded-full bg-[var(--color-surface-warm)] px-2.5 py-1 text-xs text-[var(--color-ink)]"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[var(--color-line)] pt-4 text-xs">
            <span className="inline-flex items-center gap-1 text-[var(--color-ink)]">
              <Star className="h-3.5 w-3.5 fill-[var(--color-yellow)] text-[var(--color-yellow-deep)]" />
              <span className="font-medium">5.0</span>
              <span className="text-[var(--color-ink-faint)]">(31)</span>
            </span>
            <span className="text-[var(--color-ink-muted)]">from ₹500/hr</span>
          </div>
        </Card>
      </Reveal>

      {/* Floating: AI-reviewed badge */}
      <div className="absolute -right-3 -top-4 z-20 rotate-[3deg]">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] shadow-[var(--shadow-card)]">
          <Bot className="h-3.5 w-3.5 text-[var(--color-sage-deep)]" />
          AI-reviewed · 92/100
        </div>
      </div>

      {/* Floating bottom: payout pill */}
      <div className="absolute -bottom-6 -left-6 z-20 -rotate-[2deg]">
        <Card surface="raised" className="px-4 py-3" tint="white">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            Payout · Razorpay
          </div>
          <div className="mt-1 font-display text-xl text-[var(--color-ink)]">
            ₹4,250 <span className="text-xs font-normal text-[var(--color-ink-faint)]">credited</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
// The moat
// =============================================================================

function MoatSection() {
  return (
    <Section spacing="generous" tone="warm" className="relative overflow-hidden">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <SectionEyebrow>The moat</SectionEyebrow>
            <SectionTitle>An AI quality gate on every delivery.</SectionTitle>
            <SectionLede>
              Student talent has always been a gamble. We remove the gamble: an AI
              reviewer scores every submission for completeness, brief alignment,
              and originality before the client ever sees it. Only work that
              clears the bar is delivered.
            </SectionLede>

            <ul className="mt-8 space-y-4">
              {[
                "Scored 0 to 100 against the original brief",
                "Only work above 70 is delivered, with an AI-reviewed badge",
                "Below threshold: specific fixes, then resubmit (max 3 revisions)",
                "Originality + AI-content detection keep the work genuinely the student's",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-sage)] text-[var(--color-brown-900)]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[var(--color-ink)]">{line}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal index={1}>
            <AiReviewPanel />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function AiReviewPanel() {
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
        <span className="font-semibold">PASS · </span>
        Deliverable matches the brief and reads cleanly. Minor: tighten the intro. Safe to deliver.
      </div>
    </Card>
  );
}

// =============================================================================
// The loop
// =============================================================================

function LoopSection() {
  const steps = [
    {
      n: "01",
      icon: ShieldCheck,
      title: "Post and fund",
      body: "Client posts a job and funds Razorpay escrow upfront. Funds are locked. Safe to proceed.",
      accent: "sage" as const,
    },
    {
      n: "02",
      icon: Bot,
      title: "Build and AI-review",
      body: "Verified student delivers. The AI gate scores the work against the brief. Only passing work reaches the client.",
      accent: "yellow" as const,
    },
    {
      n: "03",
      icon: Wallet,
      title: "Approve and split",
      body: "Client approves, or auto-release after 72 hours. The split settles instantly: 85% student, 15% platform.",
      accent: "orange" as const,
    },
  ];
  return (
    <Section spacing="generous">
      <Container>
        <Reveal className="max-w-2xl">
          <SectionEyebrow>The loop</SectionEyebrow>
          <SectionTitle>One safe loop, every time. No exceptions.</SectionTitle>
          <SectionLede>
            Clients pay into escrow. Students do the work. AI verifies it before
            delivery. Money releases on approval. Built so no one gets burned.
          </SectionLede>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.n} index={i}>
              <Card className="group relative h-full overflow-hidden p-7" surface="raised">
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
// Categories
// =============================================================================

function CategoriesSection() {
  return (
    <Section spacing="generous" tone="warm">
      <Container>
        <Reveal className="max-w-2xl">
          <SectionEyebrow>What students sell</SectionEyebrow>
          <SectionTitle>Every stream, mapped to real demand.</SectionTitle>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_CATEGORIES.map((cat, i) => (
            <Reveal key={cat.slug} index={i}>
              <Card className="group h-full transition-shadow hover:shadow-[var(--shadow-card-lg)]">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-medium text-[var(--color-ink)]">
                    {cat.name}
                  </h3>
                  <Badge tone={cat.tone as "trust" | "info" | "brand" | "warning"}>
                    {cat.note}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{cat.streams}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// =============================================================================
// Trust layers
// =============================================================================

function TrustSection() {
  return (
    <Section spacing="generous" id="trust" className="relative overflow-hidden">
      <div className="aurora opacity-50" />
      <Container className="relative">
        <Reveal className="max-w-2xl">
          <SectionEyebrow>Trust architecture</SectionEyebrow>
          <SectionTitle>Five layers of trust, stacked.</SectionTitle>
          <SectionLede>
            Trust is not one problem. It is five. Stuviora solves all of them so a
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
                    ? "ring-2 ring-[var(--color-sage)] ring-offset-2 ring-offset-[var(--color-background)]"
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
// Talent teasers
// =============================================================================

function TalentTeasers() {
  const talents = [
    { name: "Diya Sharma", role: "Copywriter", college: "LSR · Delhi", initials: "DS", tier: "silver" as const, accent: "yellow" },
    { name: "Aarav Mehta", role: "Full-stack dev", college: "IIT Bombay", initials: "AM", tier: "gold" as const, accent: "sage" },
    { name: "Ananya Iyer", role: "Data analyst", college: "Christ University", initials: "AI", tier: "silver" as const, accent: "orange" },
    { name: "Rohan Gupta", role: "Social media", college: "Symbiosis Pune", initials: "RG", tier: "bronze" as const, accent: "yellow" },
  ];

  return (
    <Section spacing="generous">
      <Container>
        <Reveal className="max-w-2xl">
          <SectionEyebrow>Verified talent</SectionEyebrow>
          <SectionTitle>A small sample of the bench.</SectionTitle>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {talents.map((t, i) => (
            <Reveal key={t.name} index={i}>
              <Card className="h-full p-5">
                <div className="flex items-start gap-3">
                  <span
                    className={
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[var(--color-brown-900)] " +
                      (t.accent === "sage"
                        ? "bg-[var(--color-sage)]"
                        : t.accent === "yellow"
                        ? "bg-[var(--color-yellow)]"
                        : "bg-[var(--color-orange)]")
                    }
                  >
                    {t.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-base font-medium text-[var(--color-ink)]">
                      {t.name}
                    </div>
                    <div className="truncate text-xs text-[var(--color-ink-muted)]">
                      {t.role}
                    </div>
                    <div className="truncate text-xs text-[var(--color-ink-faint)]">
                      {t.college}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)] pt-3">
                  <TrustTierBadge tier={t.tier} size="sm" />
                  <Link
                    href="/explore"
                    className="text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-sage-deep)]"
                  >
                    View profile →
                  </Link>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button href="/explore" variant="secondary">
            See all verified students <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Container>
    </Section>
  );
}

// =============================================================================
// Closing CTA
// =============================================================================

function ClosingCta() {
  return (
    <Section spacing="generous">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] bg-[var(--color-brown)] px-8 py-20 text-center text-[var(--color-cream)] sm:px-14 sm:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(50% 60% at 30% 0%, rgba(171,194,112,0.35) 0%, transparent 60%), radial-gradient(45% 45% at 80% 100%, rgba(253,167,105,0.35) 0%, transparent 60%)",
              }}
            />
            <div className="relative">
              <Logomark
                className="mx-auto h-14 w-14 text-[var(--color-cream)]"
                accent="var(--color-sage)"
              />
              <h2 className="mt-6 font-display text-balance text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl">
                Your skills are already worth money.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-[var(--color-cream)]/80 sm:text-lg">
                You just need the right platform. Students keep{" "}
                {Math.round((1 - COMMISSION_RATE) * 100)}%, get paid safely, and
                build a portfolio with every job.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  href="/auth/signup/student"
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  Create your free profile <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  href="/how-it-works"
                  size="lg"
                  variant="ghost"
                  className="w-full text-[var(--color-cream)] hover:bg-white/10 sm:w-auto"
                >
                  See how it works
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
