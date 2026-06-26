# Stuviora

![CI](https://github.com/tekigowtham2204/stuviora/actions/workflows/ci.yml/badge.svg)

**India's first AI-powered student freelancing platform.** Every deliverable passes an AI quality check before it reaches the client — _"Hire students. Trust the platform."_

This repository is the **complete full product** (responsive web app), built phase by phase. See [`../STUVIORA_MASTER_PLAN.md`](../STUVIORA_MASTER_PLAN.md) for the strategy and milestone roadmap.

## Stack

| Layer | Tech |
|------|------|
| Framework | Next.js 16 (App Router, React 19) |
| Styling | Tailwind CSS v4 |
| Data / Auth / Storage / Realtime | Supabase (Postgres) |
| Payments | Razorpay Route (escrow + 85/15 split) |
| AI | Anthropic Claude (quality gate, proposals, pricing) |
| Async jobs | Inngest + Vercel Cron |
| Email | Resend |
| Deploy | Vercel |

> **Next.js 16 note:** Middleware is now **Proxy** (`proxy.ts`). Request APIs (`cookies()`, `headers()`, route `params`) are async. Before changing framework code, read the version-matched docs in `node_modules/next/dist/docs/` (see `AGENTS.md`).

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — runs in DEMO_MODE without keys
npm run dev
```

Open http://localhost:3000.

### Demo mode

With no Supabase keys set, the app runs in **DEMO_MODE**: seeded data, simulated escrow, and a mocked AI gate, so the entire core loop is clickable without credentials. Add the Supabase env vars to switch to live data; add each other service key to enable that integration.

## Project structure

```
app/
  (public)/      Landing, explore, how-it-works, public profiles
  (auth)/        Login, signup (role picker), OTP verify
  (student)/     Student portal — onboarding → earnings
  (client)/      Client portal — post jobs → pay
  (shared)/      Messages, settings
  (admin)/       Founder admin
  (university)/  University B2B partner portal
  api/           Route handlers (payments webhook, AI, uploads)
components/       ui/ primitives + layout + feature components
lib/              env, constants, supabase/, llm/, ai/, razorpay/, inngest/, auth/
supabase/         SQL migrations (37 tables + RLS)
proxy.ts          Auth + role-based routing (Next 16 middleware)
```

## Operating principles

Stuviora sells trust, so what we are allowed to build is constrained: honest
labelling, a quality gate that judges work and not people, student data
ownership, escrow integrity, and no dark patterns. See [`PRINCIPLES.md`](./PRINCIPLES.md).

## Build milestones

M0 Scaffold · M1 Schema + Auth · M2 Profiles/Jobs/Services · M3 Payments + AI gate + Orders (core loop live) · M4 Trust/Disputes/Tax · M5 Matching + AI features · M6 Hardening · M7 Mobile + B2B.
