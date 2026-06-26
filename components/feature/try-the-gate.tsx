"use client";

import { useId, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { scoreDemoGate, type DemoGateResult } from "@/lib/ai/demo-scorer";
import { AI_GATE_PASS_THRESHOLD } from "@/lib/constants";

/**
 * Interactive AI gate demo widget for the /vision page. An investor types
 * a brief + a draft and sees the same dimension breakdown the production
 * gate emits. Pure client-side: uses the deterministic scoreDemoGate, no
 * round-trip and no LLM cost.
 *
 * Honesty: labelled "demo scorer" so the page never claims the live LLM
 * ran. The shape and threshold match the live gate, so the experience
 * accurately represents what a real submission would feel like.
 */

const SAMPLE_BRIEF = {
  title: "Write a 500-word blog post on the rise of student freelancing in India",
  description:
    "Audience: SMB owners. Tone: confident, factual. Must include at least two recent statistics with sources. End with a 3-bullet takeaway list.",
};

const SAMPLE_PASS_DRAFT =
  "The rise of student freelancing in India is reshaping how SMBs hire creative and technical talent. According to India Skills Report 2026, the gig workforce is projected to reach 23.5 million by 2030, with Gen Z making up roughly 30%. Demand Sage further reports that freelancing has grown over 25% year on year, driven by remote-work adoption and AI tooling that lowers the barrier to delivery quality. For SMBs, this means a deep, affordable bench of college-verified specialists who can ship content, code, design, and analysis without the overhead of an agency. The trade-off has always been trust: how do you hire someone with no resume and no track record? Platforms that bake verification into the workflow, escrowed payments, skill assessments, and an AI gate that scores deliverables against the brief before the client sees them, are the ones unlocking this market. Takeaways: SMBs should expect more granular task-level hiring; students should treat their first three platform jobs as the new entry-level resume; quality protocols, not platform brand, will decide who wins.";

const SAMPLE_FAIL_DRAFT = "Students freelance now. It is good. Hire them.";

export function TryTheGate() {
  const briefId = useId();
  const draftId = useId();
  const [brief, setBrief] = useState(SAMPLE_BRIEF.description);
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<DemoGateResult | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    startTransition(() => {
      // Tiny artificial delay so the UI reads as "the gate is thinking".
      // Pure-function scoring is instantaneous; the brief beat helps the
      // result feel earned, not faked.
      setTimeout(() => {
        const r = scoreDemoGate({
          seed: brief.slice(0, 32) + draft.slice(0, 32),
          jobTitle: SAMPLE_BRIEF.title,
          jobDescription: brief,
          submissionText: draft,
        });
        setResult(r);
      }, 380);
    });
  }

  function loadPass() {
    setDraft(SAMPLE_PASS_DRAFT);
    setResult(null);
  }
  function loadFail() {
    setDraft(SAMPLE_FAIL_DRAFT);
    setResult(null);
  }

  const dims = result
    ? [
        { label: "Brief alignment", value: result.briefAlignment, max: 40 },
        { label: "Completeness", value: result.completeness, max: 30 },
        { label: "Quality", value: result.quality, max: 30 },
      ]
    : [];

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-sage)] text-[var(--color-brown-900)]">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <div className="font-display text-base font-semibold text-[var(--color-ink)]">
              Try the AI gate
            </div>
            <div className="text-xs text-[var(--color-ink-faint)]">
              Demo scorer. Same shape, same threshold as the live gate.
            </div>
          </div>
        </div>
        <span className="hidden rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface-warm)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)] sm:inline">
          Pass mark {AI_GATE_PASS_THRESHOLD} / 100
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <label
            htmlFor={briefId}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]"
          >
            The brief
          </label>
          <textarea
            id={briefId}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={5}
            className="mt-2 w-full rounded-2xl border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-3 text-sm leading-relaxed text-[var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)]"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor={draftId}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]"
            >
              The student&apos;s draft
            </label>
            <div className="flex gap-2 text-[11px]">
              <button
                type="button"
                onClick={loadPass}
                className="rounded-full border border-[var(--color-line-strong)] px-2.5 py-1 font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-warm)]"
              >
                Load passing
              </button>
              <button
                type="button"
                onClick={loadFail}
                className="rounded-full border border-[var(--color-line-strong)] px-2.5 py-1 font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-warm)]"
              >
                Load failing
              </button>
            </div>
          </div>
          <textarea
            id={draftId}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            placeholder="Paste a draft, or use Load passing / Load failing."
            className="mt-2 w-full rounded-2xl border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-3 text-sm leading-relaxed text-[var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)]"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[var(--color-ink-muted)]">
          The gate scores brief alignment (/40), completeness (/30), and
          quality (/30). Anything below {AI_GATE_PASS_THRESHOLD} bounces back.
        </p>
        <button
          type="button"
          onClick={run}
          disabled={pending || draft.trim().length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-orange)] px-5 py-2.5 text-sm font-semibold text-[var(--color-brown-900)] transition-[transform,background-color,box-shadow] hover:bg-[var(--color-orange-deep)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {pending ? "Scoring..." : "Run the gate"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={String(result.score) + result.verdict}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.23, 1, 0.32, 1],
            }}
            className="mt-7 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-warm)] p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {result.verdict === "PASS" ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-sage)] text-[var(--color-brown-900)]">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-orange)] text-[var(--color-brown-900)]">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                )}
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                    Verdict
                  </div>
                  <div className="font-display text-xl font-medium text-[var(--color-ink)]">
                    {result.verdict === "PASS"
                      ? "PASS, auto-capture + deliver"
                      : "FAIL, back to the student"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
                  Score
                </div>
                <div className="font-display text-3xl font-medium tabular-nums text-[var(--color-ink)]">
                  {result.score}
                  <span className="ml-1 text-xs font-normal text-[var(--color-ink-faint)]">
                    / 100
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {dims.map((d, i) => (
                <motion.div
                  key={d.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.08 * i,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--color-ink-muted)]">
                      {d.label}
                    </span>
                    <span className="font-mono font-medium tabular-nums text-[var(--color-ink)]">
                      {d.value} / {d.max}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--color-surface)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.value / d.max) * 100}%` }}
                      transition={{
                        duration: 0.6,
                        delay: 0.1 + 0.08 * i,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                      className={
                        result.verdict === "PASS"
                          ? "h-full rounded-full bg-gradient-to-r from-[var(--color-sage)] to-[var(--color-sage-deep)]"
                          : "h-full rounded-full bg-gradient-to-r from-[var(--color-orange)] to-[var(--color-orange-deep)]"
                      }
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {result.issues.length > 0 && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                    Issues raised
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs text-[var(--color-ink)]">
                    {result.issues.map((i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-orange)]" />
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                    Suggested fixes
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs text-[var(--color-ink)]">
                    {result.suggestions.map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-sage-deep)]" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <p className="mt-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3 text-xs italic leading-relaxed text-[var(--color-ink-muted)]">
              Reviewer note: {result.reviewerNote}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
