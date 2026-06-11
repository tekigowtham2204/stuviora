-- ============================================================================
-- Stuviora — monetization + teams (P9.1 / P9.2 / P9.3)
-- ----------------------------------------------------------------------------
-- featured listings, client subscriptions, and team orders.
-- ============================================================================

-- P9.1: paid promotion window on a job. Set by the payments webhook when
-- a featured purchase is captured; listings sort active-featured first.
alter table jobs
  add column if not exists featured_until timestamptz;

create index if not exists idx_jobs_featured
  on jobs (featured_until)
  where featured_until is not null;

-- P9.2: client subscription tier (free | growth | scale). Charged via
-- Razorpay Subscriptions in live mode; entitlements resolved in
-- lib/monetization/subscriptions.ts.
create type client_plan as enum ('free', 'growth', 'scale');

create table client_subscriptions (
  client_id                uuid primary key references users(id) on delete cascade,
  plan                     client_plan not null default 'free',
  razorpay_subscription_id text,
  current_period_end       timestamptz,
  status                   text not null default 'active',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

alter table client_subscriptions enable row level security;

create policy client_subscriptions_read_own
  on client_subscriptions for select
  using (auth.uid() = client_id);

-- P9.3: team members on an order. Payout splits via Razorpay Route
-- multi-transfer using lib/teams/split.computeTeamSplit.
create table order_team_members (
  order_id   uuid not null references orders(id) on delete cascade,
  student_id uuid not null references users(id) on delete cascade,
  -- Share of the student payout in basis points (10000 = 100%).
  share_bps  integer not null check (share_bps > 0 and share_bps <= 10000),
  is_lead    boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (order_id, student_id)
);

alter table order_team_members enable row level security;

create policy order_team_members_read_own
  on order_team_members for select
  using (auth.uid() = student_id);
