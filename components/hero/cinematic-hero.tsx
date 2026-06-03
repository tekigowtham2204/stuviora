"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, GraduationCap, Building2 } from "lucide-react";
import { HandshakeHero } from "@/components/hero/handshake-scene";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

/**
 * The cinematic hero. A 200vh pinned scroll-story.
 * Visitor scrolls through 4 narrative beats; the R3F scene + SVG silhouette
 * + headline copy all transform off the same progress motion value.
 */
export function CinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Per-beat text opacity. Beats are: 0=approach, 1=verify, 2=contact, 3=trust.
  const eyebrow1 = useTransform(scrollYProgress, [0.0, 0.15, 0.22], [1, 1, 0]);
  const eyebrow2 = useTransform(scrollYProgress, [0.22, 0.3, 0.45, 0.52], [0, 1, 1, 0]);
  const eyebrow3 = useTransform(scrollYProgress, [0.52, 0.6, 0.75, 0.82], [0, 1, 1, 0]);
  const eyebrow4 = useTransform(scrollYProgress, [0.82, 0.9, 1], [0, 1, 1]);

  // CTA / final card slides up from 0.82
  const ctaY = useTransform(scrollYProgress, [0.82, 1], [60, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.82, 0.95], [0, 1]);

  return (
    <section
      ref={containerRef}
      className="relative h-[260vh]"
      aria-label="The AI-verified handshake"
    >
      {/* Sticky stage that holds the scene + UI for the entire scroll */}
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-hero-canvas">
        <div className="aurora" />

        {/* The 3D scene */}
        <HandshakeHero progress={scrollYProgress} />

        {/* Foreground UI — typography beats anchored top + CTA bottom */}
        <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-12 lg:py-16">
          {/* Top: the brand origin */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-background)_50%,transparent)] px-3 py-1 text-xs font-medium text-foreground backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-trust-400" />
              India&apos;s first AI-verified freelancing platform
            </motion.div>
          </div>

          {/* Middle: the four beats */}
          <div className="pointer-events-none relative w-full">
            {/* Each eyebrow is absolutely positioned so they crossfade in-place. */}
            <div className="relative mx-auto h-[200px] max-w-4xl">
              <Beat opacity={eyebrow1} subtitle="Two strangers. One platform.">
                Trust, before the work begins.
              </Beat>
              <Beat opacity={eyebrow2} subtitle="Every deliverable, AI-verified.">
                The quality gate India was missing.
              </Beat>
              <Beat opacity={eyebrow3} subtitle="The handshake completes.">
                Escrow releases. The student is paid.
              </Beat>
              <Beat opacity={eyebrow4} subtitle={BRAND.tagline}>
                {BRAND.name}
              </Beat>
            </div>
          </div>

          {/* Bottom: CTA card materializes at beat 4 */}
          <motion.div
            style={{ y: ctaY, opacity: ctaOpacity }}
            className="pointer-events-auto w-full max-w-2xl"
          >
            <div className="rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-background)_72%,transparent)] p-4 shadow-2xl backdrop-blur-xl sm:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button href="/auth/signup/student" size="lg" variant="primary" className="w-full">
                  <GraduationCap className="h-5 w-5" /> Earn as a student
                </Button>
                <Button href="/auth/signup/client" size="lg" variant="trust" className="w-full">
                  <Building2 className="h-5 w-5" /> Hire student talent
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted">
                <span>College-verified students</span>
                <span className="h-1 w-1 rounded-full bg-[var(--color-border-strong)]" />
                <span>Razorpay escrow</span>
                <span className="h-1 w-1 rounded-full bg-[var(--color-border-strong)]" />
                <span>AI-reviewed before delivery</span>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-subtle">
              <Link href="/how-it-works" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                See how the loop works <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Subtle scroll affordance, only on first beat */}
        <motion.div
          aria-hidden
          style={{ opacity: eyebrow1 }}
          className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-subtle"
        >
          scroll
        </motion.div>
      </div>
    </section>
  );
}

function Beat({
  opacity,
  subtitle,
  children,
}: {
  opacity: MotionValue<number>;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-x-0 top-0 text-center"
    >
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted">
        {subtitle}
      </div>
      <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
        {children}
      </h1>
    </motion.div>
  );
}
