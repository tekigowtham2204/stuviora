import { ShieldCheck, Bot, Wallet, BadgeCheck, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { CinematicHero } from "@/components/hero/cinematic-hero";
import { AiReviewSpotlight } from "@/components/sections/ai-review-spotlight";
import {
  BRAND,
  SERVICE_CATEGORIES,
  TRUST_LAYERS,
  COMMISSION_RATE,
} from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      {/* Beat 1: the cinematic 3D hero, scroll-controlled */}
      <CinematicHero />

      {/* Beat 2: the moat, spotlit. AI gate UI scans in. */}
      <AiReviewSpotlight />

      {/* Beat 3: the loop, told as three movements */}
      <section className="border-t border-[var(--color-border)] py-24">
        <Container>
          <Reveal className="max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted">The loop</span>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              One safe loop, every time. No exceptions.
            </h2>
            <p className="mt-4 text-muted">
              Clients pay into escrow. Students do the work. AI verifies it before delivery. Money releases on approval. Built so no one gets burned.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                icon: ShieldCheck,
                title: "Post & fund",
                body: "Client posts a job, funds Razorpay escrow upfront. Funds are locked — safe to proceed.",
                tone: "trust" as const,
              },
              {
                n: "02",
                icon: Bot,
                title: "Build & AI-review",
                body: "Verified student delivers. The AI gate scores the work against the brief; only passing work reaches the client.",
                tone: "brand" as const,
              },
              {
                n: "03",
                icon: Wallet,
                title: "Approve & split",
                body: "Client approves, or auto-release after 72h. The split settles instantly: 85% student, 15% platform.",
                tone: "warning" as const,
              },
            ].map((step, i) => (
              <Reveal key={step.n} index={i}>
                <Card className="group relative h-full overflow-hidden">
                  <span className="text-xs font-mono text-subtle">{step.n}</span>
                  <span
                    className={
                      "mt-4 flex h-10 w-10 items-center justify-center rounded-lg " +
                      (step.tone === "trust"
                        ? "bg-trust-100 text-trust-700 dark:bg-trust-900/40 dark:text-trust-300"
                        : step.tone === "brand"
                        ? "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"
                        : "bg-[color-mix(in_oklab,var(--color-gold-500)_18%,transparent)] text-[var(--color-gold-700)] dark:text-[var(--color-gold-300)]")
                    }
                  >
                    <step.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Beat 4: services, ten verified streams */}
      <section className="border-t border-[var(--color-border)] py-24">
        <Container>
          <Reveal className="max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted">What students sell</span>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Every stream, mapped to real demand.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_CATEGORIES.map((cat, i) => (
              <Reveal key={cat.slug} index={i}>
                <Card className="group h-full transition-shadow hover:shadow-[0_8px_30px_rgb(0_0_0_/_0.08)] dark:hover:shadow-[0_8px_40px_rgb(83_74_183_/_0.18)]">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold">{cat.name}</h3>
                    <Badge tone={cat.tone}>{cat.note}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">{cat.streams}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Beat 5: the five trust layers */}
      <section id="trust" className="relative overflow-hidden border-t border-[var(--color-border)] py-24">
        <div className="aurora opacity-50" />
        <Container className="relative">
          <Reveal className="max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted">Trust architecture</span>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Five layers of trust, stacked.
            </h2>
            <p className="mt-4 text-muted">
              Trust is not one problem; it is five. Stuviora solves all of them so a first-time client can hire a first-time student with confidence.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {TRUST_LAYERS.map((layer, i) => (
              <Reveal key={layer.n} index={i}>
                <Card
                  className={
                    "h-full " +
                    (layer.moat
                      ? "ring-1 ring-brand-300 dark:ring-brand-500"
                      : "")
                  }
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                      {layer.n}
                    </span>
                    {layer.moat && <BadgeCheck className="h-4 w-4 text-brand-500 dark:text-brand-300" />}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">{layer.title}</h3>
                  <p className="mt-1 text-xs font-medium text-muted">&ldquo;{layer.q}&rdquo;</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{layer.desc}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Beat 6: closing CTA, the warm contact moment in static */}
      <section className="border-t border-[var(--color-border)] py-24">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-16 text-center text-white sm:px-12 sm:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(60% 60% at 50% 100%, rgba(224,176,112,0.35) 0%, transparent 60%)",
                }}
              />
              <div className="relative">
                <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  Your skills are already worth money.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-white/85">
                  You just need the right platform. Students keep{" "}
                  {Math.round((1 - COMMISSION_RATE) * 100)}%, get paid safely, and build a portfolio with every job.
                </p>
                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button
                    href="/auth/signup/student"
                    size="lg"
                    variant="trust"
                    className="w-full sm:w-auto"
                  >
                    Create your free profile <ArrowRight className="h-4 w-4" />
                  </Button>
                  <a
                    href="/how-it-works"
                    className="text-sm font-medium text-white/90 transition-colors hover:text-white"
                  >
                    See how it works →
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
