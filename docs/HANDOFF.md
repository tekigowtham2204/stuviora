# Stuviora — Handoff / Continue-Here

Read this first when resuming on a new machine. It captures everything that
was machine-local (Claude memory, project directive, current state) so you and
Claude can pick up exactly where the last session left off.

> Quick start for Claude: **"Read `docs/HANDOFF.md` and `docs/STUVIORA_MASTER_PLAN.md`, then continue with M5."**

---

## 1. What Stuviora is

India-first, AI-powered **student freelancing marketplace**. The moat: a
**Claude AI quality gate** reviews every deliverable before it reaches the
client. Positioning: _"Hire students. Trust the platform."_

## 2. The directive (non-negotiable)

- **Build the complete full product — explicitly NOT an MVP.** All pages, all
  37+ DB tables, every engine (payment-split, dispute, matching, trust-score,
  tax), background jobs, university B2B. Nothing is cut or deferred.
- **First target = one responsive web app** (desktop + tablet + mobile-web from
  a single Next.js codebase). The native Expo mobile app is a later phase
  (M7), not part of the first target.
- Sequence by **dependency**, not by minimalism. Ship the core loop (M3) first
  so it can earn while the rest is built around it — but never propose cutting
  features to "ship faster."

## 3. Stack (fixed)

Next.js **16** (App Router, React 19) · Tailwind CSS v4 · Supabase (Postgres /
Auth / Storage / Realtime) · Razorpay **Route** (escrow + 85/15 split) ·
Anthropic Claude (quality gate, proposals, pricing) · Inngest + Vercel Cron
(async) · Resend (email) · Vercel (deploy).

> **Next.js 16 gotcha:** Middleware is renamed **Proxy** (`proxy.ts`). Request
> APIs (`cookies()`, `headers()`, route `params`, `searchParams`) are **async**.
> Before changing framework code, read the version-matched docs in
> `node_modules/next/dist/docs/` — see `AGENTS.md`. This Next.js differs from
> training-data assumptions.

## 4. Where the build is RIGHT NOW

**Done: M1, M2, M3, M4.** Runs end-to-end in **DEMO_MODE** (no keys needed).

- **M1** — full 38-table schema + RLS (`supabase/migrations/`), Supabase Auth,
  role-based routing (`proxy.ts`), auth pages.
- **M2** — profiles + onboarding (student/client), jobs, services + packages,
  skills taxonomy, dashboards, public profile, explore.
- **M3 (core loop)** — Razorpay escrow + 85/15 split + webhook
  (`app/api/payments/webhook`), AI quality gate (`lib/ai/quality-gate.ts`),
  orders (bid → hire → submit → review → approve / 72h auto-release), messaging,
  reviews.
- **M4 (this session)** — trust, disputes, tax, admin:
  - **Trust engine** `lib/trust/score.ts` — `rating·0.40 + on_time·0.25 +
    ai_pass·0.20 + response·0.15`; Bronze→Platinum tiers; budget gating.
    Page: `/student/trust`.
  - **Dispute engine** `lib/disputes/engine.ts` — state machine
    `open → evidence_collection → admin_review → resolved`, 48h escalation,
    escrow hold + unwind. Pages: shared `/disputes` + `/disputes/[id]`; admin
    queue. Actions: `app/actions/disputes.ts`.
  - **Tax engine** `lib/tax/engine.ts` — GST 18% on commission, TDS 5%
    (Sec.194H) over ₹30k FY threshold, PAN capture, Form 16A. Page:
    `/student/tax`; GST invoice on completed orders. Action: `app/actions/tax.ts`.
  - **Admin portal** `app/(admin)/` — GMV/revenue dashboard, dispute queue
    (resolve/advance), user management, immutable audit trail. Admin persona +
    login. Actions: `app/actions/admin.ts`.

**Architecture pattern to keep following:**
- All data reads go through `lib/data/queries.ts` (returns seeded demo data
  today; each fn is the single place to swap in a Supabase query when live).
- Demo dataset: `lib/demo/data.ts`. Shared types: `lib/types.ts`. Status/label
  metadata: `lib/status.ts`. Session/persona: `lib/auth/session.ts`.
- Engines live in `lib/<domain>/`, pure + unit-testable, with "live path" notes
  in comments. Server Actions in `app/actions/`.
- UI primitives in `components/ui/`; portal chrome via
  `components/layout/portal-shell.tsx`.

## 5. NEXT UP: M5 — Intelligence & growth

From the master plan (see `docs/STUVIORA_MASTER_PLAN.md` §4):
- **Smart matching engine** `(skill_overlap·0.45 + budget_fit·0.25 +
  trust·0.20 + availability·0.10)`; top-20 notify; 3-emails/student/day cap.
  Table `matching_scores` already exists.
- **AI proposal writer + pricing engine.**
- **Portfolio auto-generator** — completed job → Claude case study draft
  (`portfolio_items` table exists, `is_published=false` as draft).
- **Discovery** — Meilisearch full-text search.
- **Retention jobs** — weekly earnings digest, smart notifications, prefs
  (`notification_preferences` table exists).

Then M6 (hardening/observability) and M7 (Expo mobile + university B2B).

## 6. Design rules (apply to ALL UI)

Three Claude design skills drove the look (impeccable, design-taste-frontend,
emil-design-eng). Even without them installed, follow these:
- Motion via the `motion` package (`import { motion } from "motion/react"`).
  Custom easing `cubic-bezier(0.23,1,0.32,1)` (token `ease-out-strong`). UI
  anims < 300ms; button `:active` → `scale(0.97)`; always honor
  `prefers-reduced-motion`; **never animate from `scale(0)`**.
- **HARD BAN: em-dashes (—) and en-dashes (–) anywhere user-visible.** Use
  periods, commas, colons, or hyphens.
- Purple brand is allowed (it's the brand) but use with restraint. Geist font.
  `lucide-react` icons (project depends on them).
- Brand tokens + easing live in `app/globals.css`. Reusable motion primitive:
  `components/motion/reveal.tsx`.
- After building a surface, run impeccable's `/polish` and `/audit` as the final
  pass (if the skills are installed).

To reinstall the design skills, see `docs/reference/skills-lock.json`.

## 7. Resume checklist on the new machine

1. Install: **Node 20+**, **Git**, **Claude Code**.
2. `git clone https://github.com/tekigowtham2204/stuviora.git && cd stuviora`
3. `npm install`  (node_modules was intentionally not committed)
4. `npm run dev`  → http://localhost:3000 (DEMO_MODE: login picks a persona —
   student / client / admin — no keys required).
5. `npx tsc --noEmit` to confirm the M4 additions typecheck (this was not run in
   the last session before the laptop switch — do it first).
6. Open Claude Code in the repo and point it at this file + the master plan.

## 8. Secrets (do NOT commit)

`.env*` is gitignored. For **live mode** you'll need keys for: Supabase (URL +
anon + service_role), Razorpay Route (key id/secret + webhook secret),
Anthropic, Resend, Inngest, Upstash. Keep these in a password manager — they do
not transfer with the repo and were not on GitHub.

Run `cp .env.example .env.local` and fill in keys to leave DEMO_MODE. Adding
just the Supabase keys switches data to live; add each other service to enable
that integration.
