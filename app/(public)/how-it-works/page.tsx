import {
  ShieldCheck,
  Bot,
  Wallet,
  GraduationCap,
  Building2,
  BadgeCheck,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { TRUST_LAYERS } from "@/lib/constants";

export const metadata = {
  title: "How it works",
  description:
    "A guided walkthrough of how Stuviora works for students and clients, from signup to AI-reviewed delivery and escrow-protected payout.",
};

const STUDENT_STEPS = [
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
    title: "List services, bid on jobs",
    body: "Create service packages or apply to jobs with one-click AI proposal hints (the pitch stays yours). Higher trust tiers unlock higher-budget jobs.",
  },
  {
    icon: Wallet,
    title: "Deliver, get paid",
    body: "Submit work, the AI gate reviews it, the client approves, and the 85% split lands in your wallet. Withdraw to UPI or bank when ready.",
  },
];

const CLIENT_STEPS = [
  {
    icon: Building2,
    title: "Post a job, set your budget",
    body: "Describe what you need, add a budget range and deadline. Our matching engine notifies the best-fit students within minutes.",
  },
  {
    icon: ShieldCheck,
    title: "Hire and fund escrow",
    body: "Review proposals ranked by trust score and fit. Pick the student you like, fund Razorpay escrow, and work begins. Funds are locked, safe.",
  },
  {
    icon: Bot,
    title: "Receive AI-reviewed work",
    body: "Before delivery, every submission passes the AI quality gate for brief alignment, completeness, originality, and polish. You only see passing work.",
  },
  {
    icon: BadgeCheck,
    title: "Approve, or 72-hour auto-release",
    body: "Approve to release payment to the student. Don't respond? Auto-release after 72 hours. Have a problem? Open a dispute, we mediate.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-surface-muted">
        <Container className="py-16 lg:py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge tone="brand">How Stuviora works</Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              One safe loop, from signup to settled payout.
            </h1>
            <p className="mt-4 text-lg text-muted">
              Two sides, same loop. Both protected by escrow, both held to the same AI-reviewed quality standard.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Student path */}
      <section className="py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
            <div>
              <Badge tone="brand">For students</Badge>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Your skills are worth money. We make them safe to sell.
              </h2>
              <p className="mt-3 text-sm text-muted">
                Get verified, get matched, get paid. We remove the scary parts (pricing, pitching, getting scammed) so you can focus on the work itself.
              </p>
              <Button href="/auth/signup/student" className="mt-5">
                Start earning
              </Button>
            </div>
            <ol className="space-y-3">
              {STUDENT_STEPS.map((s, i) => (
                <Reveal key={s.title} index={i} as="li">
                  <Card className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Step {i + 1}
                      </div>
                      <h3 className="mt-1 text-base font-semibold">{s.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* Client path */}
      <section className="bg-surface-muted py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
            <div>
              <Badge tone="trust">For clients</Badge>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Hire student talent without rolling the dice.
              </h2>
              <p className="mt-3 text-sm text-muted">
                Every deliverable passes an AI quality check before it reaches you. Pay only on approval, with a first-job money-back guarantee.
              </p>
              <Button href="/auth/signup/client" variant="trust" className="mt-5">
                Hire talent
              </Button>
            </div>
            <ol className="space-y-3">
              {CLIENT_STEPS.map((s, i) => (
                <Reveal key={s.title} index={i} as="li">
                  <Card className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-trust-100 text-trust-700">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Step {i + 1}
                      </div>
                      <h3 className="mt-1 text-base font-semibold">{s.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* Trust architecture */}
      <section className="py-16">
        <Container>
          <Reveal className="max-w-2xl">
            <Badge tone="info">Why it's safe</Badge>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Five layers of trust</h2>
            <p className="mt-3 text-muted">
              Trust isn't one problem; it's five. Stuviora solves all five so a first-time client can hire a first-time student with confidence.
            </p>
          </Reveal>
          <ol className="mt-8 grid gap-3 md:grid-cols-2">
            {TRUST_LAYERS.map((l, i) => (
              <Reveal key={l.n} index={i} as="li">
                <Card className={l.moat ? "ring-2 ring-brand-300" : ""}>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                      {l.n}
                    </span>
                    {l.title}
                    {l.moat && <Badge tone="warning">The moat</Badge>}
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">&ldquo;{l.q}&rdquo;</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{l.desc}</p>
                </Card>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
