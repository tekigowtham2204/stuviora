"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

/**
 * Income calculator (audit #2). Client-side widget: pick what you do and
 * how many projects a month; see the take-home estimate (after the 15%
 * platform share). Numbers mirror the pricing engine's category floors
 * and typical project sizes; copy stays honest with "typical" framing.
 */

const CATEGORIES = [
  { slug: "content-copywriting", name: "Content & copywriting", typical: 3000 },
  { slug: "tech-development", name: "Tech & development", typical: 8000 },
  { slug: "design-creative", name: "Design & creative", typical: 5000 },
  { slug: "business-research", name: "Business & research", typical: 4000 },
  { slug: "social-marketing", name: "Social media & marketing", typical: 3500 },
  { slug: "data-ai", name: "Data & AI services", typical: 6000 },
];

const STUDENT_SHARE = 0.85;

export function IncomeCalculator() {
  const [slug, setSlug] = useState(CATEGORIES[0].slug);
  const [projects, setProjects] = useState(3);
  const cat = CATEGORIES.find((c) => c.slug === slug)!;
  const monthly = Math.round(cat.typical * projects * STUDENT_SHARE);

  return (
    <div className="mx-auto max-w-xl rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
        <Calculator className="h-4 w-4 text-[var(--color-sage-deep)]" />
        What could you earn?
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[var(--color-ink-muted)]">I do</span>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-ink)]"
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[var(--color-ink-muted)]">
            Projects per month: <strong className="text-[var(--color-ink)]">{projects}</strong>
          </span>
          <input
            type="range"
            min={1}
            max={8}
            value={projects}
            onChange={(e) => setProjects(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--color-sage-deep)]"
            aria-label="Projects per month"
          />
        </label>
      </div>
      <div className="mt-5 rounded-2xl bg-[var(--color-sage-50)] p-4 text-center">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-sage-900)]">
          Your estimated take-home
        </div>
        <div className="mt-1 font-display text-3xl font-medium tabular-nums text-[var(--color-ink)]">
          Rs.{monthly.toLocaleString("en-IN")}
          <span className="text-base text-[var(--color-ink-muted)]"> /month</span>
        </div>
        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
          Based on typical {cat.name.toLowerCase()} project sizes. You keep 85% of every project.
        </p>
      </div>
    </div>
  );
}
