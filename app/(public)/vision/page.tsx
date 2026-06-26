import {
  ArrowRight,
  Bot,
  CircleDashed,
  Compass,
  Database,
  GraduationCap,
  LineChart,
  Lock,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Section,
  SectionEyebrow,
  SectionTitle,
  SectionLede,
} from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { Logomark } from "@/components/brand/logomark";
import { JsonLd } from "@/components/seo/json-ld";
import {
  AI_GATE_PASS_THRESHOLD,
  COMMISSION_RATE,
  ESCROW_AUTO_RELEASE_HOURS,
  MAX_REVISIONS,
} from "@/lib/constants";

export const metadata = {
  title: "Vision",
  description:
    "Stuviora's 10x vision: a fully autonomous trust layer for student work in India. No staff in the loop. AI verifies, escrow holds, payouts auto-settle.",
};

export default function VisionPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Stuviora Vision",
          url: "https://stuviora.com/vision",
          description:
            "The 10x thesis: a self-running trust layer for verified student work, starting in India.",
        }}
      />
      <Hero />
      <NoHumansLoop />
      <WhyNow />
      <Wedge />
      <Horizons />
      <DataMoat />
      <UnitEconomics />
      <NorthStar />
      <Ask />
    </>
  );
}

// 1. Hero =====================================================================

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-hero-canvas">
        <div className="aurora" />
        <Container className="relative px-4 pb-20 pt-20 sm:pb-28 sm:pt-28 lg:pb-32 lg:pt-32">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge tone="dark" className="mx-auto">
              <Sparkles className="h-3 w-3" /> Investor brief
            </Badge>
            <h1 className="mt-7 font-display text-balance text-5xl font-medium leading-[1.04] tracking-tight text-[var(--color-ink)] sm:text-6xl lg:text-7xl">
              From safe gigs today,
              <span className="block">
                to the{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">trust layer</span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-full bg-[var(--color-yellow)]/70"
                  />
                </span>{" "}
                for student work.
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-[var(--color-ink-muted)]">
              Stuviora is the only marketplace where every deliverable passes an
              AI quality check before the client sees it. The 10x bet: turn that
              gate into a fully autonomous trust protocol, with zero humans in
              the order loop, that compounds into a labeled corpus no incumbent
              can replicate.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="#ask" variant="primary" size="lg">
                The ask <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="#horizons" variant="secondary" size="lg">
                See the three horizons
              </Button>
            </div>
          </Reveal>
        </Container>
      </div>
    </section>
  );
}

// 2. No humans in the loop ====================================================

function NoHumansLoop() {
  // The autonomous order flow. Each step is a state in the order machine; no
  // staff ever touches a healthy order, and an unhealthy one ends in refund,
  // not arbitration.
  const studentSharePct = Math.round((1 - COMMISSION_RATE) * 100);
  const steps: {
    n: string;
    icon: LucideIcon;
    title: string;
    body: string;
    accent: "sage" | "yellow" | "orange" | "brown";
  }[] = [
    {
      n: "01",
      icon: Lock,
      title: "Hold, do not charge",
      body:
        "On hire, Razorpay authorises the full amount and holds it. The card is not charged yet. The student knows the money exists; the client has not paid.",
      accent: "sage",
    },
    {
      n: "02",
      icon: Bot,
      title: "AI gate decides",
      body: `Submission scored to 100 on brief alignment, completeness, and quality. PASS at ${AI_GATE_PASS_THRESHOLD} or above means the work is delivery-grade. FAIL means specific fixes, then resubmit. Up to ${MAX_REVISIONS} attempts.`,
      accent: "yellow",
    },
    {
      n: "03",
      icon: Zap,
      title: "PASS auto-captures",
      body:
        "On PASS the platform captures the hold the same instant it delivers the file. Client pays on receipt of verified work; student is guaranteed the funds.",
      accent: "orange",
    },
    {
      n: "04",
      icon: ShieldCheck,
      title: "Silent dispute window",
      body: `Client gets ${ESCROW_AUTO_RELEASE_HOURS} hours to dispute. A dispute forces an AI gate re-run if revisions remain, or refunds. Silence settles the payout. No staff ever needed.`,
      accent: "sage",
    },
    {
      n: "05",
      icon: CircleDashed,
      title: "3x FAIL voids the hold",
      body:
        "Three failed attempts and the authorisation is voided. The client is never charged; the student is paid nothing; no human dispute case is opened.",
      accent: "brown",
    },
    {
      n: "06",
      icon: Wallet,
      title: "Settle and split",
      body: `Funds release ${studentSharePct}% to the student, ${Math.round(
        COMMISSION_RATE * 100,
      )}% platform fee. GST + TDS handled inline. The whole loop runs without a support ticket.`,
      accent: "sage",
    },
  ];

  return (
    <Section spacing="generous" tone="warm">
      <Container>
        <Reveal className="max-w-3xl">
          <SectionEyebrow>The autonomous loop</SectionEyebrow>
          <SectionTitle>
            No humans in the order loop. Not one. Ever.
          </SectionTitle>
          <SectionLede>
            Incumbents need an army of dispute reviewers and approval chasers.
            We removed the human from every healthy order, and we made every
            unhealthy order end in refund, not arbitration. The unit economics
            do not require us to scale staff with GMV.
          </SectionLede>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.n} index={i}>
              <Card className="group relative h-full overflow-hidden p-7" surface="raised">
                <span className="font-display text-xs text-[var(--color-ink-faint)]">
                  {step.n}
                </span>
                <span
                  className={
                    "mt-4 flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--color-brown-900)] " +
                    (step.accent === "sage"
                      ? "bg-[var(--color-sage)]"
                      : step.accent === "yellow"
                      ? "bg-[var(--color-yellow)]"
                      : step.accent === "orange"
                      ? "bg-[var(--color-orange)]"
                      : "bg-[var(--color-brown)] text-[var(--color-cream)]")
                  }
                >
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-medium text-[var(--color-ink)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  {step.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal index={6}>
          <div className="mt-10 rounded-3xl border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-7 text-sm leading-relaxed text-[var(--color-ink-muted)]">
            <span className="font-semibold text-[var(--color-ink)]">
              Why auth-and-capture changes the economics.
            </span>{" "}
            Most marketplaces charge upfront and reverse later. That requires
            chargebacks, refund reserves, and human reviewers. We hold the
            authorisation, capture only on AI PASS, and void on 3x FAIL. The
            payment processor never sees a disputed transaction in the happy
            path. Operating cost per order trends toward the API fee.
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

// 3. Why now ==================================================================

function WhyNow() {
  const forces: { icon: LucideIcon; title: string; body: string }[] = [
    {
      icon: GraduationCap,
      title: "Demographic dividend",
      body:
        "India has ~12 to 15 million freelancers today, on a trajectory toward ~23 million by 2029-30, with Gen Z already ~30% of the gig workforce. The next decade of online work in India is being staffed right now, by people in college.",
    },
    {
      icon: Bot,
      title: "AI inflection",
      body:
        "Inline quality verification of unstructured deliverables (essays, code, designs, decks) only became economically viable in the last 18 months. The wedge is open because the tech to fill it just shipped.",
    },
    {
      icon: ShieldCheck,
      title: "Regulatory tailwind",
      body:
        "UGC's curriculum framework makes a 60 to 120 hour internship mandatory for UG programmes, with credits attached. Every college placement cell now needs documentable, verifiable experiential work. We are that record.",
    },
    {
      icon: TrendingUp,
      title: "SMB digitisation",
      body:
        "India's SMB sector is digitising fast and cannot afford agency rates. Verified student talent at fair prices, with money-back safety, is the natural fit. The buyer exists; the trust did not.",
    },
  ];

  return (
    <Section spacing="generous">
      <Container>
        <Reveal className="max-w-3xl">
          <SectionEyebrow>Why now</SectionEyebrow>
          <SectionTitle>
            Four forces are converging. The window is open.
          </SectionTitle>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {forces.map((f, i) => (
            <Reveal key={f.title} index={i}>
              <Card className="flex h-full gap-4 p-7" surface="raised">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-sage)] text-[var(--color-brown-900)]">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle>{f.title}</CardTitle>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                    {f.body}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// 4. The wedge ================================================================

function Wedge() {
  const incumbents = [
    {
      name: "Internshala",
      gap: "Free, but no inline quality verification. Brand is internships, not paid freelance work.",
    },
    {
      name: "Truelancer",
      gap: "Basic escrow. Generalist. Students compete against professionals with no protection.",
    },
    {
      name: "Upwork",
      gap: "Hostile to no-history profiles. AI investments target matching and fraud, not deliverable QA.",
    },
    {
      name: "Fiverr",
      gap: "20% take rate, race-to-bottom pricing. AI Verified badges; no inline deliverable gate.",
    },
  ];

  return (
    <Section spacing="generous" tone="warm">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_1fr]">
          <Reveal>
            <SectionEyebrow>The wedge</SectionEyebrow>
            <SectionTitle>
              No incumbent runs an inline AI deliverable gate.
            </SectionTitle>
            <SectionLede>
              Their AI investments point at matching, fraud, and skill badges,
              all upstream of the work. We score the work itself, before the
              client sees it. That single primitive lets us promise something
              nobody else can: a first-time client can hire a first-time
              student and the platform stands behind the result.
            </SectionLede>
            <div className="mt-7 grid gap-3">
              {[
                "Scored 0 to 100 against the brief",
                "Originality + AI-content detection",
                "Below the bar bounces back, never reaches the client",
                "Every review is logged: brief vs delivery vs outcome",
              ].map((line, i) => (
                <Reveal key={line} index={i}>
                  <div className="flex items-start gap-3 text-sm text-[var(--color-ink)]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-sage)] text-[var(--color-brown-900)]">
                      <Sparkles className="h-3 w-3" />
                    </span>
                    <span>{line}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal index={1}>
            <Card className="p-7" surface="glow">
              <div className="flex items-center justify-between">
                <CardTitle>What they are not doing</CardTitle>
                <Badge tone="sage">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              </div>
              <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                Web-verified competitive scan, 2026-06.
              </p>
              <ul className="mt-5 divide-y divide-[var(--color-line)]">
                {incumbents.map((c) => (
                  <li key={c.name} className="py-3.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-base font-medium text-[var(--color-ink)]">
                        {c.name}
                      </span>
                      <Badge tone="neutral">No inline gate</Badge>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-ink-muted)]">
                      {c.gap}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

// 5. Three horizons ===========================================================

function Horizons() {
  const horizons: {
    tag: string;
    title: string;
    icon: LucideIcon;
    body: string;
    bullets: string[];
    accent: "sage" | "yellow" | "orange";
  }[] = [
    {
      tag: "Today",
      title: "AI-verified freelancing for Indian SMBs",
      icon: Compass,
      accent: "sage",
      body: "Verified students sell content, code, design, research, and marketing to small businesses. Razorpay Route holds the money, the AI gate checks the work, payouts auto-settle.",
      bullets: [
        "85/15 take rate, GST + TDS inline",
        "College-email verification on every signup",
        "Razorpay escrow with 72h auto-release",
        "Disputes resolved by re-running the gate, not by staff",
      ],
    },
    {
      tag: "24 months",
      title: "University OS for the placement era",
      icon: Network,
      accent: "yellow",
      body: "Every Indian college that needs credit-bearing internships and placement evidence runs on Stuviora. Cohort dashboards, attributed signups, GMV per institution. Distribution at near-zero CAC.",
      bullets: [
        "Cohort + GMV dashboards per institution",
        "NEP 2020 credit reporting per student",
        "Invite attribution + revenue share with the college",
        "First-job money-back guarantee subsidised at the campus level",
      ],
    },
    {
      tag: "10x",
      title: "The trust protocol for verified online work",
      icon: Rocket,
      accent: "orange",
      body: "The AI quality gate becomes a licensable verification protocol. The student trust score becomes a portable credential, the credit score for student work. We expand into SE Asia first, then any market where institutional trust is the missing primitive.",
      bullets: [
        "Verification-as-a-service for adjacent marketplaces",
        "Portable Stuviora ID + trust score across platforms",
        "Agent-mediated hiring: clients describe outcomes, the platform routes, prices, and verifies end-to-end",
        "Geographic expansion: SE Asia, then MENA",
      ],
    },
  ];

  return (
    <Section spacing="generous" id="horizons">
      <Container>
        <Reveal className="max-w-3xl">
          <SectionEyebrow>The three horizons</SectionEyebrow>
          <SectionTitle>Compounding from gigs to a global protocol.</SectionTitle>
          <SectionLede>
            Each horizon funds and de-risks the next. We do not need horizon
            three to make the business work; horizons one and two return the
            fund by themselves. Horizon three is the asymmetric upside.
          </SectionLede>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {horizons.map((h, i) => (
            <Reveal key={h.tag} index={i}>
              <Card className="relative flex h-full flex-col p-7" surface="raised">
                <div className="flex items-center justify-between">
                  <Badge
                    tone={
                      h.accent === "sage"
                        ? "sage"
                        : h.accent === "yellow"
                        ? "yellow"
                        : "orange"
                    }
                  >
                    {h.tag}
                  </Badge>
                  <span
                    className={
                      "flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-brown-900)] " +
                      (h.accent === "sage"
                        ? "bg-[var(--color-sage)]"
                        : h.accent === "yellow"
                        ? "bg-[var(--color-yellow)]"
                        : "bg-[var(--color-orange)]")
                    }
                  >
                    <h.icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-medium text-[var(--color-ink)]">
                  {h.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  {h.body}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {h.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-xs leading-relaxed text-[var(--color-ink)]"
                    >
                      <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-ink-muted)]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// 6. Data moat ================================================================

function DataMoat() {
  return (
    <Section spacing="generous" tone="warm">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <Reveal>
            <SectionEyebrow>The compounding moat</SectionEyebrow>
            <SectionTitle>
              A labelled corpus of student work that did not exist before.
            </SectionTitle>
            <SectionLede>
              The AI gate prompt is copyable in a weekend. The calibration
              dataset is not. Every order produces a labelled triple, brief,
              submission, and human-confirmed outcome, across creative,
              technical, and analytical categories. Nobody else has it.
            </SectionLede>
            <p className="mt-5 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Within 12 months of meaningful GMV, the dataset is the asset.
              It calibrates the gate so it is both stricter and more
              forgiving in the right places. It is also the foundation for
              the verification protocol we license to others.
            </p>
          </Reveal>

          <Reveal index={1}>
            <Card className="p-7" surface="glow">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-sage)] text-[var(--color-brown-900)]">
                  <Database className="h-5 w-5" />
                </span>
                <CardTitle>What each order produces</CardTitle>
              </div>
              <ul className="mt-6 space-y-4 text-sm">
                {[
                  {
                    k: "Brief",
                    v: "Structured job spec with category, deliverable type, and acceptance criteria.",
                  },
                  {
                    k: "Submission",
                    v: "The student's actual work: text, code, file, or design, with extraction metadata.",
                  },
                  {
                    k: "AI verdict",
                    v: "0 to 100 score, per-dimension breakdown, specific issues raised.",
                  },
                  {
                    k: "Outcome",
                    v: "Human-confirmed: client approved, requested revision, disputed, or refunded.",
                  },
                ].map((row, i) => (
                  <Reveal key={row.k} index={i} as="li">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-[var(--color-orange)]" />
                      <div>
                        <div className="font-semibold text-[var(--color-ink)]">
                          {row.k}
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-ink-muted)]">
                          {row.v}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-[var(--color-sage-200)] bg-[var(--color-sage-50)] p-4 text-xs leading-relaxed text-[var(--color-sage-900)]">
                <span className="font-semibold">The flywheel.</span> More
                orders sharpen the gate; a sharper gate raises pass rates and
                trust; higher trust drives more orders. We win by running it
                first.
              </div>
            </Card>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

// 7. Unit economics ===========================================================

function UnitEconomics() {
  const studentSharePct = Math.round((1 - COMMISSION_RATE) * 100);
  const platformPct = Math.round(COMMISSION_RATE * 100);

  return (
    <Section spacing="generous">
      <Container>
        <Reveal className="max-w-3xl">
          <SectionEyebrow>The model</SectionEyebrow>
          <SectionTitle>Asset-light. Cash-positive per order.</SectionTitle>
          <SectionLede>
            No inventory, no salaries scaling with GMV, no manual approvals.
            Every healthy order is profitable from order one because the
            entire loop is software.
          </SectionLede>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <UnitStat
            icon={Wallet}
            label="Platform take rate"
            value={`${platformPct}%`}
            sub="Inclusive of GST on commission."
          />
          <UnitStat
            icon={GraduationCap}
            label="Student share on PASS"
            value={`${studentSharePct}%`}
            sub="Captured the moment delivery is verified."
          />
          <UnitStat
            icon={Bot}
            label="Marginal cost per order"
            value="Sub-rupee"
            sub="AI gate + payment processor fees."
          />
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Reveal>
            <Card className="p-7" surface="raised">
              <CardTitle>Why the take rate holds</CardTitle>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                15% sits between Truelancer at 8 to 10% and Fiverr at a flat
                20%. The premium is paid for one thing: the inline gate. As
                long as that gate is the difference between a usable
                deliverable and a scam, the rate is defensible. We sell the
                gate, not the rate.
              </p>
            </Card>
          </Reveal>
          <Reveal index={1}>
            <Card className="p-7" surface="raised">
              <CardTitle>Why CAC compounds down</CardTitle>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                Distribution rides the college channel: signed institutional
                partnerships push verified students in at near-zero cost. We
                share revenue with the college; the college gets credit-bearing
                placement evidence. Both sides win, fast.
              </p>
            </Card>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function UnitStat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Reveal>
      <Card className="p-7" surface="raised">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-sage)] text-[var(--color-brown-900)]">
          <Icon className="h-5 w-5" />
        </span>
        <div className="mt-5 text-xs uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
          {label}
        </div>
        <div className="mt-1 font-display text-3xl font-medium tabular-nums text-[var(--color-ink)]">
          {value}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[var(--color-ink-muted)]">
          {sub}
        </p>
      </Card>
    </Reveal>
  );
}

// 8. North star ===============================================================

function NorthStar() {
  const milestones = [
    { label: "First paid loop", value: "1", sub: "CPO/w" },
    { label: "Month 3", value: "75", sub: "CPO/w" },
    { label: "Month 6", value: "200", sub: "CPO/w" },
    { label: "Month 12", value: "1,000", sub: "CPO/w" },
  ];
  return (
    <Section spacing="generous" tone="warm">
      <Container>
        <Reveal className="max-w-3xl">
          <SectionEyebrow>The one number we run on</SectionEyebrow>
          <SectionTitle>
            Completed paid orders per week. Everything else is noise.
          </SectionTitle>
          <SectionLede>
            CPO/w is the loop spinning: a real client paid a real student for
            real work that cleared the AI gate. Every other metric is upstream
            or downstream of it. Here is the trajectory the model needs.
          </SectionLede>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {milestones.map((m, i) => (
            <Reveal key={m.label} index={i}>
              <Card className="text-center" surface="raised">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                  {m.label}
                </div>
                <div className="mt-2 font-display text-4xl font-medium tabular-nums text-[var(--color-ink)]">
                  {m.value}
                </div>
                <div className="mt-1 text-xs text-[var(--color-ink-faint)]">
                  {m.sub}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal index={4}>
          <Card className="mt-10 flex flex-col gap-4 p-7 sm:flex-row sm:items-center sm:justify-between" surface="raised">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-yellow)] text-[var(--color-brown-900)]">
                <LineChart className="h-5 w-5" />
              </span>
              <div>
                <CardTitle>Published, not promised.</CardTitle>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  Live traction lands on /trust the moment it is real. Until
                  then, the page shows policy facts, not invented social proof.
                </p>
              </div>
            </div>
            <Button href="/trust" variant="secondary">
              See live trust numbers <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </Reveal>
      </Container>
    </Section>
  );
}

// 9. The ask ==================================================================

function Ask() {
  return (
    <Section spacing="generous" id="ask">
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
                  Back the trust layer, not just the marketplace.
                </h2>
                <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-[var(--color-cream)]/80 sm:text-lg">
                  We are building the first marketplace that does not need
                  humans to run. Investors who back Stuviora are funding the
                  dataset and the protocol, not just an Indian gig site.
                </p>
                <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row">
                  <Button
                    href="mailto:invest@stuviora.com?subject=Stuviora%20investor%20intro"
                    size="lg"
                    variant="primary"
                  >
                    Talk to the founders <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    href="/trust"
                    size="lg"
                    variant="ghost"
                    className="text-[var(--color-cream)] hover:bg-white/10"
                  >
                    See the trust architecture
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                <AskStat label="Take rate" value="15%" />
                <AskStat label="Humans in the loop" value="0" />
                <AskStat label="Auto-capture latency" value="< 1s" />
                <AskStat label="Auto-release window" value={`${ESCROW_AUTO_RELEASE_HOURS}h`} />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

function AskStat({ label, value }: { label: string; value: string }) {
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
