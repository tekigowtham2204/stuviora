"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "motion/react";
import { Bot, ShieldCheck, BadgeCheck, Sparkles, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";

/**
 * Section 2 of the landing — the AI quality gate dramatized.
 * A scroll-driven scan beam runs through the score panel as the user reads.
 * One signature motion. Premium, not noisy.
 */
export function AiReviewSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });

  // Scan beam goes top-down as the section scrolls through view.
  const scanY = useTransform(scrollYProgress, [0.1, 0.7], ["0%", "100%"]);
  const scanOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.6, 0.7], [0, 1, 1, 0]);

  // Score values animate up as the user scrolls — all hoisted to the top.
  const score = useTransform(scrollYProgress, [0.15, 0.55], [0, 86]);
  const scoreRounded = useTransform(score, (v) => Math.round(v));
  const briefAlignment = useTransform(scrollYProgress, [0.15, 0.55], [0, 36]);
  const completeness = useTransform(scrollYProgress, [0.18, 0.6], [0, 27]);
  const quality = useTransform(scrollYProgress, [0.22, 0.65], [0, 23]);
  const originality = useTransform(scrollYProgress, [0.25, 0.7], [0, 96]);

  const POINTS: { text: string; icon: LucideIcon }[] = [
    { text: "Scored 0-100 against the original brief", icon: BadgeCheck },
    {
      text: "Only work scoring 70+ is delivered, with an “AI-reviewed” badge",
      icon: ShieldCheck,
    },
    { text: "Below threshold? Specific fixes, then resubmit (max 3 revisions)", icon: Sparkles },
    {
      text: "Originality and AI-content detection keep the work genuinely the student's",
      icon: Bot,
    },
  ];

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)] py-24 lg:py-32"
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_520px]">
          {/* Left: the narrative */}
          <div>
            <Badge tone="warning">The moat</Badge>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              An AI quality gate on
              <br /> every delivery.
            </h2>
            <p className="mt-5 max-w-lg text-muted">
              Student talent has always been a gamble for clients. We remove the gamble: before any work reaches a client, our AI reviews it for completeness, brief alignment, and originality.
            </p>
            <ul className="mt-7 space-y-3">
              {POINTS.map(({ text, icon: Icon }, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-trust-100 text-trust-700 dark:bg-trust-900/40 dark:text-trust-300">
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className="text-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: the live scoring panel with scan beam */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
              {/* The scan beam */}
              {!reduced && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 z-10 h-24"
                  style={{
                    top: scanY,
                    opacity: scanOpacity,
                    background:
                      "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--color-brand-400) 25%, transparent), transparent)",
                    transform: "translateY(-50%)",
                  }}
                />
              )}

              {/* Panel header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">AI quality review</div>
                    <div className="font-mono text-xs text-subtle">order #SV-1042</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted">Score</div>
                  <div className="font-mono text-3xl font-semibold text-foreground">
                    <motion.span>{scoreRounded}</motion.span>
                  </div>
                </div>
              </div>

              {/* Bars */}
              <div className="mt-6 space-y-4">
                <ScoreBar label="Brief alignment" value={briefAlignment} max={40} tone="brand" />
                <ScoreBar label="Completeness" value={completeness} max={30} tone="brand" />
                <ScoreBar label="Quality" value={quality} max={30} tone="brand" />
                <ScoreBar label="Originality" value={originality} max={100} tone="trust" />
              </div>

              {/* Reviewer note */}
              <div className="mt-5 rounded-lg border border-trust-200/60 bg-trust-50/60 p-3 text-xs leading-relaxed text-trust-700 dark:border-trust-700/30 dark:bg-trust-900/20 dark:text-trust-300">
                <span className="font-medium">PASS · </span>
                Deliverable matches the brief and reads cleanly. Minor: tighten the intro. Safe to deliver.
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 12, rotate: -4 }}
              whileInView={{ opacity: 1, y: 0, rotate: -4 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="absolute -bottom-4 -right-4 flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold shadow-lg"
            >
              <BadgeCheck className="h-4 w-4 text-trust-500" />
              AI-reviewed
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ScoreBar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: MotionValue<number>;
  max: number;
  tone: "brand" | "trust";
}) {
  const width = useTransform(value, (v) => `${(v / max) * 100}%`);
  const rounded = useTransform(value, (v) => Math.round(v));
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-mono font-medium text-foreground">
          <motion.span>{rounded}</motion.span>/{max}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
        <motion.div
          style={{ width }}
          className={
            "h-full rounded-full " +
            (tone === "trust"
              ? "bg-gradient-to-r from-trust-400 to-trust-600"
              : "bg-gradient-to-r from-brand-400 to-brand-600")
          }
        />
      </div>
    </div>
  );
}
