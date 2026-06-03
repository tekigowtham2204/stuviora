import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: "About",
  description: `${BRAND.name}: ${BRAND.tagline}. ${BRAND.positioning}`,
};

export default function AboutPage() {
  return (
    <Container className="py-16 lg:py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Badge tone="brand">About Stuviora</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          We built the platform we wish had existed in college.
        </h1>
        <p className="mt-4 text-lg text-muted">
          {BRAND.meaning}.
        </p>
      </Reveal>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        <Reveal>
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">The problem</h2>
            <p className="mt-3 text-base leading-relaxed text-foreground">
              Indian students have real, sellable skills: writing, design, code, research. But every existing freelance platform fails them twice. Clients don&apos;t trust them, and students don&apos;t know how to price, pitch, or get paid safely.
            </p>
          </Card>
        </Reveal>
        <Reveal index={1}>
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Our wedge</h2>
            <p className="mt-3 text-base leading-relaxed text-foreground">
              An AI quality gate on every delivery. Before any work reaches a client, our AI reviews it for completeness, coherence, and originality. Clients stop gambling on student talent. The platform&apos;s only job is to keep that trust honest.
            </p>
          </Card>
        </Reveal>
      </div>

      <Reveal index={2} className="mx-auto mt-10 max-w-3xl rounded-2xl bg-brand-gradient p-8 text-center text-white sm:p-12">
        <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {BRAND.tagline}
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-white/85">
          Built in India, for India. College-verified students, escrow-protected payments, AI-reviewed delivery.
        </p>
      </Reveal>
    </Container>
  );
}
