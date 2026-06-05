import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Section, SectionEyebrow, SectionTitle, SectionLede } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { Logomark } from "@/components/brand/logomark";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: "About",
  description: `${BRAND.name}: ${BRAND.tagline}. ${BRAND.positioning}`,
};

export default function AboutPage() {
  return (
    <>
      <Section spacing="tight" tone="cream" className="bg-hero-canvas">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>About Stuviora</SectionEyebrow>
            <SectionTitle as="h1" className="mt-4 sm:text-5xl">
              We built the platform we wish had existed in college.
            </SectionTitle>
            <SectionLede className="mx-auto">{BRAND.meaning}.</SectionLede>
          </Reveal>
        </Container>
      </Section>

      <Section spacing="default" tone="white">
        <Container>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            <Reveal>
              <Card className="h-full p-7">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
                  The problem
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[var(--color-ink)]">
                  Indian students have real, sellable skills: writing, design, code,
                  research. But every existing freelance platform fails them twice.
                  Clients do not trust them, and students do not know how to price,
                  pitch, or get paid safely.
                </p>
              </Card>
            </Reveal>
            <Reveal index={1}>
              <Card className="h-full p-7">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
                  Our wedge
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[var(--color-ink)]">
                  An AI quality gate on every delivery. Before any work reaches a
                  client, our AI reviews it for completeness, coherence, and
                  originality. Clients stop gambling on student talent. The platform's
                  only job is to keep that trust honest.
                </p>
              </Card>
            </Reveal>
          </div>

          <Reveal index={2} className="mx-auto mt-12 max-w-3xl">
            <div className="relative overflow-hidden rounded-[36px] bg-[var(--color-brown)] p-10 text-center text-[var(--color-cream)] sm:p-14">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(50% 60% at 30% 0%, rgba(171,194,112,0.35) 0%, transparent 60%), radial-gradient(45% 45% at 80% 100%, rgba(253,167,105,0.35) 0%, transparent 60%)",
                }}
              />
              <div className="relative">
                <Logomark
                  className="mx-auto h-10 w-10 text-[var(--color-cream)]"
                  accent="var(--color-sage)"
                />
                <h3 className="mt-5 font-display text-3xl font-medium tracking-tight sm:text-4xl">
                  {BRAND.tagline}
                </h3>
                <p className="mx-auto mt-4 max-w-xl text-[var(--color-cream)]/80">
                  Built in India, for India. College-verified students,
                  escrow-protected payments, AI-reviewed delivery.
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
