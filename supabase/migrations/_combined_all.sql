-- Stuviora: all 12 migrations concatenated in order.
-- Paste into the Supabase SQL editor (Project -> SQL Editor -> New query) and run.
-- Generated 2026-06-14T16:09:57Z. Do not edit by hand; regenerate from supabase/migrations/.


-- ============================================================
-- 0001_init_schema.sql
-- ============================================================
-- ============================================================================
-- Stuviora — initial schema (M1)
-- 38 tables across 8 domains. Designed for Supabase Postgres.
-- RLS policies live in 0002_rls_policies.sql.
-- ============================================================================

create extension if not exists pgcrypto;      -- gen_random_uuid()
create extension if not exists citext;         -- case-insensitive email

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type user_role          as enum ('student', 'client', 'admin', 'university');
create type kyc_status          as enum ('none', 'pending', 'verified', 'rejected');
create type trust_tier          as enum ('bronze', 'silver', 'gold', 'platinum');
create type job_status          as enum ('draft', 'open', 'in_review', 'awarded', 'closed', 'cancelled');
create type proposal_status     as enum ('submitted', 'shortlisted', 'accepted', 'rejected', 'withdrawn');
create type order_status        as enum (
  'pending_payment', 'active', 'submitted', 'in_ai_review',
  'awaiting_approval', 'revision_requested', 'completed', 'disputed', 'refunded', 'cancelled'
);
create type submission_status   as enum ('review_in_progress', 'passed', 'failed', 'review_error');
create type ai_verdict          as enum ('PASS', 'FAIL');
create type payment_status      as enum ('pending', 'escrowed', 'released', 'refunded', 'failed');
create type commission_status   as enum ('pending', 'settled', 'reversed', 'dispute_hold');
create type withdrawal_status   as enum ('requested', 'processing', 'paid', 'failed');
create type tax_type            as enum ('TDS', 'GST');
create type ledger_type         as enum ('COMMISSION', 'REFUND', 'ADJUSTMENT');
create type dispute_status      as enum ('open', 'evidence_collection', 'admin_review', 'resolved');
create type dispute_resolution  as enum ('pending', 'client_favour', 'student_favour', 'partial');
create type service_tier        as enum ('basic', 'standard', 'premium');

-- updated_at trigger helper
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ============================================================================
-- DOMAIN 1 — Users & identity
-- ============================================================================

-- Public profile mirror of auth.users. id == auth.users.id.
create table users (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role not null default 'student',
  email         citext unique not null,
  full_name     text,
  avatar_url    text,
  phone         text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_users_updated before update on users for each row execute function set_updated_at();

create table colleges (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  city          text,
  state         text,
  type          text,                          -- e.g. 'university', 'autonomous'
  created_at    timestamptz not null default now()
);

-- Verified Indian university email domains (allowlist).
create table college_domains (
  id            uuid primary key default gen_random_uuid(),
  college_id    uuid references colleges(id) on delete set null,
  domain        citext unique not null,        -- e.g. 'iitb.ac.in'
  is_verified   boolean not null default true,
  created_at    timestamptz not null default now()
);

create table student_profiles (
  user_id       uuid primary key references users(id) on delete cascade,
  college_id    uuid references colleges(id),
  stream        text,                           -- CS, Commerce, Literature...
  year_of_study smallint,
  city          text,
  bio           text,
  headline      text,
  username      citext unique,                  -- public profile slug
  pan_encrypted text,                           -- AES-256 in Supabase Vault (Sec.194H TDS)
  kyc           kyc_status not null default 'none',
  trust_score   numeric(5,2) not null default 0,
  trust_tier    trust_tier not null default 'bronze',
  jobs_completed integer not null default 0,
  is_available  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_student_profiles_updated before update on student_profiles for each row execute function set_updated_at();

create table client_profiles (
  user_id       uuid primary key references users(id) on delete cascade,
  company_name  text,
  gstin         text,
  website       text,
  city          text,
  kyc           kyc_status not null default 'none',
  jobs_posted   integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_client_profiles_updated before update on client_profiles for each row execute function set_updated_at();

create table notification_preferences (
  user_id           uuid primary key references users(id) on delete cascade,
  email_job_matches boolean not null default true,
  email_messages    boolean not null default true,
  email_digest      boolean not null default true,
  push_enabled      boolean not null default true,
  updated_at        timestamptz not null default now()
);
create trigger trg_notif_prefs_updated before update on notification_preferences for each row execute function set_updated_at();

-- Immutable audit trail of privileged admin actions.
create table admin_actions (
  id            uuid primary key default gen_random_uuid(),
  admin_id      uuid references users(id),
  action        text not null,                  -- 'dispute_resolved', 'payout_override', 'user_ban'
  target_type   text,
  target_id     uuid,
  reason        text not null,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- DOMAIN 2 — Skills taxonomy
-- ============================================================================
create table skill_tags (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  category      text                            -- maps to service category
);

create table student_skills (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references users(id) on delete cascade,
  skill_id      uuid not null references skill_tags(id) on delete cascade,
  proficiency   smallint default 3,             -- 1..5, validated by skill assessment
  unique (student_id, skill_id)
);

create table job_skill_requirements (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null,                  -- FK added after jobs created
  skill_id      uuid not null references skill_tags(id) on delete cascade,
  weight        numeric(3,2) default 1.0
);

-- ============================================================================
-- DOMAIN 3 — Jobs, proposals & services
-- ============================================================================
create table job_categories (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  description   text
);

create table jobs (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references users(id) on delete cascade,
  category_id   uuid references job_categories(id),
  title         text not null,
  description   text not null,
  budget_min    numeric(10,2),
  budget_max    numeric(10,2),
  deadline      timestamptz,
  status        job_status not null default 'open',
  attachments   jsonb default '[]'::jsonb,
  proposals_count integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_jobs_updated before update on jobs for each row execute function set_updated_at();
alter table job_skill_requirements
  add constraint fk_jsr_job foreign key (job_id) references jobs(id) on delete cascade;

create table proposals (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null references jobs(id) on delete cascade,
  student_id    uuid not null references users(id) on delete cascade,
  cover_letter  text not null,
  bid_amount    numeric(10,2) not null,
  delivery_days smallint,
  status        proposal_status not null default 'submitted',
  ai_assisted   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (job_id, student_id)
);
create trigger trg_proposals_updated before update on proposals for each row execute function set_updated_at();

create table service_listings (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references users(id) on delete cascade,
  category_id   uuid references job_categories(id),
  title         text not null,
  description   text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_service_listings_updated before update on service_listings for each row execute function set_updated_at();

create table service_packages (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references service_listings(id) on delete cascade,
  tier          service_tier not null,
  price         numeric(10,2) not null,
  delivery_days smallint,
  description   text,
  unique (listing_id, tier)
);

-- Cached matching scores from the smart-match background job.
create table matching_scores (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null references jobs(id) on delete cascade,
  student_id    uuid not null references users(id) on delete cascade,
  score         numeric(5,2) not null,
  breakdown     jsonb,                          -- {skill, budget, trust, availability}
  created_at    timestamptz not null default now(),
  unique (job_id, student_id)
);

-- ============================================================================
-- DOMAIN 4 — Orders & delivery
-- ============================================================================
create table orders (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid references jobs(id),
  proposal_id     uuid references proposals(id),
  client_id       uuid not null references users(id),
  student_id      uuid not null references users(id),
  amount          numeric(10,2) not null,
  status          order_status not null default 'pending_payment',
  deadline        timestamptz,
  approved_at     timestamptz,                  -- start of 72h auto-release window
  completed_at    timestamptz,
  revision_count  smallint not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_orders_updated before update on orders for each row execute function set_updated_at();

create table order_submissions (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  student_id    uuid not null references users(id),
  notes         text,
  file_paths    jsonb default '[]'::jsonb,      -- private Supabase Storage paths
  status        submission_status not null default 'review_in_progress',
  attempt       smallint not null default 1,
  created_at    timestamptz not null default now()
);

create table ai_reviews (
  id              uuid primary key default gen_random_uuid(),
  submission_id   uuid not null references order_submissions(id) on delete cascade,
  order_id        uuid not null references orders(id) on delete cascade,
  score           smallint,                     -- 0..100
  verdict         ai_verdict,
  brief_alignment smallint,                     -- 0..40
  completeness    smallint,                     -- 0..30
  quality         smallint,                     -- 0..30
  originality     smallint,                     -- 0..100 (plagiarism / AI-content check)
  issues          jsonb default '[]'::jsonb,
  suggestions     jsonb default '[]'::jsonb,
  reviewer_note   text,
  model           text,
  created_at      timestamptz not null default now()
);

create table file_attachments (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references users(id) on delete set null,
  context_type  text,                           -- 'job', 'submission', 'message', 'dispute'
  context_id    uuid,
  storage_path  text not null,                  -- private bucket path
  file_name     text,
  mime_type     text,
  size_bytes    bigint,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- DOMAIN 5 — Payments & ledger (service_role only — see RLS)
-- ============================================================================
create table payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid references orders(id),
  client_id           uuid references users(id),
  amount              numeric(10,2) not null,
  status              payment_status not null default 'pending',
  razorpay_order_id   text,
  razorpay_payment_id text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger trg_payments_updated before update on payments for each row execute function set_updated_at();

create table student_wallets (
  student_id        uuid primary key references users(id) on delete cascade,
  available_balance numeric(12,2) not null default 0,
  pending_balance   numeric(12,2) not null default 0,
  lifetime_earnings numeric(12,2) not null default 0,
  bank_account_enc  text,                       -- encrypted
  upi_id            text,
  updated_at        timestamptz not null default now()
);
create trigger trg_wallets_updated before update on student_wallets for each row execute function set_updated_at();

create table earnings (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references users(id) on delete cascade,
  order_id      uuid references orders(id),
  amount        numeric(10,2) not null,         -- 85% payout
  status        text not null default 'pending',
  created_at    timestamptz not null default now()
);

-- Every rupee in/out for the platform.
create table platform_ledger (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid references orders(id),
  type              ledger_type not null,
  gross_amount      numeric(10,2),
  commission_amount numeric(10,2),
  gst_amount        numeric(10,2),
  net_amount        numeric(10,2),
  razorpay_payment_id text,
  created_at        timestamptz not null default now()
);

-- Per-order split record.
create table commission_events (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid references orders(id),
  student_id          uuid references users(id),
  client_id           uuid references users(id),
  job_amount          numeric(10,2),
  commission_rate     numeric(5,2) not null default 15.00,
  commission_amount   numeric(10,2),
  student_payout      numeric(10,2),
  razorpay_transfer_id text,
  status              commission_status not null default 'pending',
  settled_at          timestamptz,
  created_at          timestamptz not null default now()
);

create table transfer_log (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references orders(id),
  student_id    uuid references users(id),
  razorpay_transfer_id text,
  amount        numeric(10,2),
  status        text,
  created_at    timestamptz not null default now()
);

create table withdrawal_requests (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references users(id) on delete cascade,
  amount        numeric(10,2) not null,
  status        withdrawal_status not null default 'requested',
  destination   text,                           -- 'upi' | 'bank'
  processed_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- TDS + GST audit trail.
create table tax_events (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid references orders(id),
  user_id         uuid references users(id),
  tax_type        tax_type not null,
  taxable_amount  numeric(10,2),
  tax_rate        numeric(5,2),
  tax_amount      numeric(10,2),
  financial_year  text,                          -- e.g. '2026-27'
  created_at      timestamptz not null default now()
);

-- Idempotency guard — prevents double-credit on Razorpay webhook retries.
create table webhook_events (
  razorpay_event_id text primary key,
  event_type        text,
  payload           jsonb,
  processed_at      timestamptz not null default now()
);

-- ============================================================================
-- DOMAIN 6 — Trust, reviews & portfolio
-- ============================================================================
create table reviews (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  reviewer_id   uuid not null references users(id),
  reviewee_id   uuid not null references users(id),
  rating        smallint not null check (rating between 1 and 5),
  comment       text,
  created_at    timestamptz not null default now(),
  unique (order_id, reviewer_id)
);

create table portfolio_items (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references users(id) on delete cascade,
  order_id      uuid references orders(id),
  title         text,
  problem       text,
  approach      text,
  outcome       text,
  skills        jsonb default '[]'::jsonb,
  is_published  boolean not null default false,  -- auto-generated as draft
  created_at    timestamptz not null default now()
);

create table skill_assessments (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references users(id) on delete cascade,
  skill_id      uuid references skill_tags(id),
  score         smallint,
  passed        boolean,
  taken_at      timestamptz not null default now()
);

create table trust_score_history (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references users(id) on delete cascade,
  score         numeric(5,2),
  delta         numeric(5,2),
  tier          trust_tier,
  reason        text,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- DOMAIN 7 — Disputes
-- ============================================================================
create table dispute_cases (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  raised_by     uuid not null references users(id),
  reason        text not null,
  status        dispute_status not null default 'open',
  resolution    dispute_resolution not null default 'pending',
  resolved_by   uuid references users(id),
  deadline      timestamptz,                     -- 48h escalation timer
  resolved_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_disputes_updated before update on dispute_cases for each row execute function set_updated_at();

create table dispute_evidences (
  id            uuid primary key default gen_random_uuid(),
  dispute_id    uuid not null references dispute_cases(id) on delete cascade,
  submitted_by  uuid references users(id),
  note          text,
  file_path     text,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- DOMAIN 8 — Communications
-- ============================================================================
create table conversations (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references orders(id) on delete cascade,
  client_id     uuid not null references users(id),
  student_id    uuid not null references users(id),
  last_message_at timestamptz,
  created_at    timestamptz not null default now()
);

create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references users(id),
  body            text,
  attachment_path text,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

create table notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  type          text not null,
  title         text,
  body          text,
  link          text,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- Indexes (hot paths)
-- ============================================================================
create index idx_jobs_status        on jobs(status);
create index idx_jobs_client        on jobs(client_id);
create index idx_jobs_category      on jobs(category_id);
create index idx_proposals_job      on proposals(job_id);
create index idx_proposals_student  on proposals(student_id);
create index idx_orders_client      on orders(client_id);
create index idx_orders_student     on orders(student_id);
create index idx_orders_status      on orders(status);
create index idx_orders_autorelease on orders(status, approved_at);
create index idx_submissions_order  on order_submissions(order_id);
create index idx_ai_reviews_order   on ai_reviews(order_id);
create index idx_messages_convo     on messages(conversation_id, created_at);
create index idx_notifications_user on notifications(user_id, read_at);
create index idx_earnings_student   on earnings(student_id);
create index idx_matching_job       on matching_scores(job_id, score desc);
create index idx_student_skills     on student_skills(student_id);
create index idx_commission_status  on commission_events(status);


-- ============================================================
-- 0002_rls_policies.sql
-- ============================================================
-- ============================================================================
-- Stuviora — Row Level Security (M1)
-- Principle: RLS on every table. Money/audit tables (platform_ledger,
-- commission_events, transfer_log, tax_events, webhook_events, admin_actions)
-- get RLS enabled with NO policies → reachable only by the service_role
-- (which bypasses RLS) from trusted server code. Never from a browser session.
-- ============================================================================

-- Helper: current user's role, via SECURITY DEFINER to avoid RLS recursion.
create or replace function public.app_user_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.users where id = auth.uid()), false);
$$;

-- Enable RLS on every table -------------------------------------------------
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Reference data — public read
-- ----------------------------------------------------------------------------
create policy "ref colleges read"        on colleges        for select using (true);
create policy "ref college_domains read" on college_domains for select using (true);
create policy "ref job_categories read"  on job_categories  for select using (true);
create policy "ref skill_tags read"      on skill_tags      for select using (true);

-- ----------------------------------------------------------------------------
-- users — read own + public profile fields; update own
-- ----------------------------------------------------------------------------
create policy "users select own"   on users for select using (id = auth.uid() or is_admin());
create policy "users update own"   on users for update using (id = auth.uid());
create policy "users insert self"  on users for insert with check (id = auth.uid());

-- ----------------------------------------------------------------------------
-- Profiles — public student profiles are world-readable; clients limited
-- ----------------------------------------------------------------------------
create policy "student_profiles public read" on student_profiles for select using (true);
create policy "student_profiles write own"   on student_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "client_profiles read own"  on client_profiles
  for select using (user_id = auth.uid() or is_admin());
create policy "client_profiles write own" on client_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notif_prefs own" on notification_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Skills
-- ----------------------------------------------------------------------------
create policy "student_skills read"  on student_skills for select using (true);
create policy "student_skills write" on student_skills
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "job_skill_req read"   on job_skill_requirements for select using (true);

-- ----------------------------------------------------------------------------
-- Jobs — open jobs are readable by students; clients manage own
-- ----------------------------------------------------------------------------
create policy "jobs read open or own" on jobs
  for select using (status = 'open' or client_id = auth.uid() or is_admin());
create policy "jobs insert client" on jobs
  for insert with check (client_id = auth.uid() and app_user_role() = 'client');
create policy "jobs update own" on jobs
  for update using (client_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Proposals — student sees own; the job's client sees proposals on their job
-- ----------------------------------------------------------------------------
create policy "proposals read" on proposals
  for select using (
    student_id = auth.uid()
    or exists (select 1 from jobs j where j.id = job_id and j.client_id = auth.uid())
    or is_admin()
  );
create policy "proposals insert student" on proposals
  for insert with check (student_id = auth.uid() and app_user_role() = 'student');
create policy "proposals update own" on proposals
  for update using (student_id = auth.uid()
    or exists (select 1 from jobs j where j.id = job_id and j.client_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- Service listings & packages — public read of active; owner manages
-- ----------------------------------------------------------------------------
create policy "listings read" on service_listings
  for select using (is_active = true or student_id = auth.uid());
create policy "listings write own" on service_listings
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "packages read" on service_packages for select using (true);
create policy "packages write own" on service_packages
  for all using (exists (select 1 from service_listings l where l.id = listing_id and l.student_id = auth.uid()))
  with check (exists (select 1 from service_listings l where l.id = listing_id and l.student_id = auth.uid()));

-- matching_scores: student sees own matches
create policy "matching read own" on matching_scores
  for select using (student_id = auth.uid() or is_admin());

-- ----------------------------------------------------------------------------
-- Orders — only the two parties + admin
-- ----------------------------------------------------------------------------
create policy "orders read parties" on orders
  for select using (client_id = auth.uid() or student_id = auth.uid() or is_admin());
create policy "orders update parties" on orders
  for update using (client_id = auth.uid() or student_id = auth.uid());

create policy "submissions read parties" on order_submissions
  for select using (
    student_id = auth.uid()
    or exists (select 1 from orders o where o.id = order_id and o.client_id = auth.uid())
    or is_admin()
  );
create policy "submissions insert student" on order_submissions
  for insert with check (student_id = auth.uid());

create policy "ai_reviews read parties" on ai_reviews
  for select using (
    exists (select 1 from orders o where o.id = order_id
            and (o.client_id = auth.uid() or o.student_id = auth.uid()))
    or is_admin()
  );

create policy "attachments read own" on file_attachments
  for select using (owner_id = auth.uid() or is_admin());
create policy "attachments insert own" on file_attachments
  for insert with check (owner_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Payments-adjacent that a user may read about themselves
-- ----------------------------------------------------------------------------
create policy "payments read client" on payments
  for select using (client_id = auth.uid() or is_admin());

create policy "wallet read own" on student_wallets
  for select using (student_id = auth.uid() or is_admin());

create policy "earnings read own" on earnings
  for select using (student_id = auth.uid() or is_admin());

create policy "withdrawals read own" on withdrawal_requests
  for select using (student_id = auth.uid() or is_admin());
create policy "withdrawals insert own" on withdrawal_requests
  for insert with check (student_id = auth.uid());

-- platform_ledger, commission_events, transfer_log, tax_events,
-- webhook_events, admin_actions: RLS enabled, NO policies → service_role only.

-- ----------------------------------------------------------------------------
-- Trust, reviews & portfolio
-- ----------------------------------------------------------------------------
create policy "reviews public read" on reviews for select using (true);
create policy "reviews insert party" on reviews
  for insert with check (
    reviewer_id = auth.uid()
    and exists (select 1 from orders o where o.id = order_id
                and (o.client_id = auth.uid() or o.student_id = auth.uid()))
  );

create policy "portfolio public read" on portfolio_items
  for select using (is_published = true or student_id = auth.uid());
create policy "portfolio write own" on portfolio_items
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy "assessments read own" on skill_assessments
  for select using (student_id = auth.uid() or is_admin());

create policy "trust_history read own" on trust_score_history
  for select using (student_id = auth.uid() or is_admin());

-- ----------------------------------------------------------------------------
-- Disputes — parties to the order + admin
-- ----------------------------------------------------------------------------
create policy "disputes read parties" on dispute_cases
  for select using (
    raised_by = auth.uid()
    or exists (select 1 from orders o where o.id = order_id
               and (o.client_id = auth.uid() or o.student_id = auth.uid()))
    or is_admin()
  );
create policy "disputes insert party" on dispute_cases
  for insert with check (raised_by = auth.uid());

create policy "dispute_evidence read" on dispute_evidences
  for select using (
    exists (select 1 from dispute_cases d join orders o on o.id = d.order_id
            where d.id = dispute_id
            and (o.client_id = auth.uid() or o.student_id = auth.uid()))
    or is_admin()
  );
create policy "dispute_evidence insert" on dispute_evidences
  for insert with check (submitted_by = auth.uid());

-- ----------------------------------------------------------------------------
-- Communications — conversation participants only
-- ----------------------------------------------------------------------------
create policy "conversations read parties" on conversations
  for select using (client_id = auth.uid() or student_id = auth.uid() or is_admin());

create policy "messages read parties" on messages
  for select using (
    exists (select 1 from conversations c where c.id = conversation_id
            and (c.client_id = auth.uid() or c.student_id = auth.uid()))
  );
create policy "messages insert party" on messages
  for insert with check (
    sender_id = auth.uid()
    and exists (select 1 from conversations c where c.id = conversation_id
                and (c.client_id = auth.uid() or c.student_id = auth.uid()))
  );

create policy "notifications own" on notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ============================================================
-- 0003_seed_taxonomy.sql
-- ============================================================
-- ============================================================================
-- Stuviora — taxonomy seed (P1)
-- Seed data for skill_tags, job_categories, colleges, and college_domains.
-- Idempotent: safe to re-run; uses ON CONFLICT DO NOTHING on natural keys.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Job categories (mirrors SERVICE_CATEGORIES in lib/constants.ts)
-- ----------------------------------------------------------------------------
insert into job_categories (slug, name, description) values
  ('content-copywriting', 'Content and copywriting', 'Blog posts, web copy, scripts, captions, SEO writing.'),
  ('tech-development',    'Tech and development',    'Web apps, mobile apps, scripts, automations, APIs, integrations.'),
  ('design-creative',     'Design and creative',     'Logos, brand kits, social design, illustrations, UI mockups, decks.'),
  ('business-research',   'Business and research',   'Market research, decks, financial models, business writing.'),
  ('social-marketing',    'Social media and marketing', 'Content calendars, reels scripts, community, paid ads.'),
  ('data-ai',             'Data and AI services',    'Dashboards, data cleaning, analysis, lightweight ML.')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Skill tags. Category column maps to a category slug; loose link so we
-- can add cross-category skills without a hard FK constraint.
-- ----------------------------------------------------------------------------
insert into skill_tags (slug, name, category) values
  -- content
  ('copywriting',  'Copywriting',  'content-copywriting'),
  ('blogs',        'Blogs',        'content-copywriting'),
  ('seo',          'SEO',          'content-copywriting'),
  ('editing',      'Editing',      'content-copywriting'),
  ('ghostwriting', 'Ghostwriting', 'content-copywriting'),
  -- tech
  ('react',        'React',        'tech-development'),
  ('nextjs',       'Next.js',      'tech-development'),
  ('python',       'Python',       'tech-development'),
  ('automation',   'Automation',   'tech-development'),
  ('apis',         'APIs',         'tech-development'),
  ('nodejs',       'Node.js',      'tech-development'),
  ('typescript',   'TypeScript',   'tech-development'),
  ('django',       'Django',       'tech-development'),
  ('postgres',     'PostgreSQL',   'tech-development'),
  -- design
  ('figma',        'Figma',        'design-creative'),
  ('branding',     'Branding',     'design-creative'),
  ('social-design','Social design','design-creative'),
  ('illustration', 'Illustration', 'design-creative'),
  ('ui-design',    'UI design',    'design-creative'),
  ('decks',        'Decks',        'design-creative'),
  -- business / research
  ('research',     'Research',     'business-research'),
  ('market-research','Market research','business-research'),
  ('financial-model','Financial modeling','business-research'),
  ('excel',        'Excel',        'business-research'),
  -- social / marketing
  ('social-media', 'Social media', 'social-marketing'),
  ('reels',        'Reels',        'social-marketing'),
  ('canva',        'Canva',        'social-marketing'),
  ('copy',         'Copy',         'social-marketing'),
  -- data / ai
  ('data-viz',     'Data viz',     'data-ai'),
  ('pandas',       'Pandas',       'data-ai'),
  ('jupyter',      'Jupyter',      'data-ai'),
  ('sql',          'SQL',          'data-ai')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Colleges and their email domains (allowlist).
-- Curated starting set covering the beachhead colleges plus the
-- biggest universities/IITs/IIMs/NIDs/NLUs across India. Expand via
-- subsequent migrations as we onboard new partners. The point of this
-- seed is to make student signup possible for the v1 beachhead
-- (IIT Bombay, NID Ahmedabad, LSR Delhi, Christ U Bengaluru, Symbiosis
-- Pune) without manual data entry.
-- ----------------------------------------------------------------------------

-- IITs
insert into colleges (name, city, state, type) values
  ('IIT Bombay',          'Mumbai',      'Maharashtra',  'institute'),
  ('IIT Delhi',           'New Delhi',   'Delhi',        'institute'),
  ('IIT Madras',          'Chennai',     'Tamil Nadu',   'institute'),
  ('IIT Kanpur',          'Kanpur',      'Uttar Pradesh','institute'),
  ('IIT Kharagpur',       'Kharagpur',   'West Bengal',  'institute'),
  ('IIT Roorkee',         'Roorkee',     'Uttarakhand',  'institute'),
  ('IIT Guwahati',        'Guwahati',    'Assam',        'institute'),
  ('IIT Hyderabad',       'Hyderabad',   'Telangana',    'institute'),
  ('IIT BHU Varanasi',    'Varanasi',    'Uttar Pradesh','institute')
on conflict do nothing;

-- IIMs
insert into colleges (name, city, state, type) values
  ('IIM Ahmedabad',       'Ahmedabad',   'Gujarat',      'business school'),
  ('IIM Bangalore',       'Bengaluru',   'Karnataka',    'business school'),
  ('IIM Calcutta',        'Kolkata',     'West Bengal',  'business school'),
  ('IIM Lucknow',         'Lucknow',     'Uttar Pradesh','business school'),
  ('IIM Kozhikode',       'Kozhikode',   'Kerala',       'business school'),
  ('IIM Indore',          'Indore',      'Madhya Pradesh','business school')
on conflict do nothing;

-- Design / Creative
insert into colleges (name, city, state, type) values
  ('NID Ahmedabad',       'Ahmedabad',   'Gujarat',      'design'),
  ('Srishti Institute',   'Bengaluru',   'Karnataka',    'design'),
  ('Pearl Academy',       'New Delhi',   'Delhi',        'design')
on conflict do nothing;

-- Law
insert into colleges (name, city, state, type) values
  ('NLSIU Bangalore',     'Bengaluru',   'Karnataka',    'law'),
  ('NALSAR Hyderabad',    'Hyderabad',   'Telangana',    'law'),
  ('NLU Delhi',           'New Delhi',   'Delhi',        'law')
on conflict do nothing;

-- Universities / liberal arts / commerce
insert into colleges (name, city, state, type) values
  ('Lady Shri Ram College',     'New Delhi',   'Delhi',        'autonomous'),
  ('St Stephen''s College',     'New Delhi',   'Delhi',        'autonomous'),
  ('Hindu College',             'New Delhi',   'Delhi',        'autonomous'),
  ('Hansraj College',           'New Delhi',   'Delhi',        'autonomous'),
  ('Miranda House',             'New Delhi',   'Delhi',        'autonomous'),
  ('Sri Ram College of Commerce','New Delhi',  'Delhi',        'autonomous'),
  ('St Xavier''s College Mumbai','Mumbai',     'Maharashtra',  'autonomous'),
  ('Christ University',         'Bengaluru',   'Karnataka',    'university'),
  ('Symbiosis International University','Pune','Maharashtra',  'university'),
  ('Manipal Institute of Technology','Manipal','Karnataka',    'institute'),
  ('VIT Vellore',               'Vellore',     'Tamil Nadu',   'institute'),
  ('BITS Pilani',               'Pilani',      'Rajasthan',    'institute'),
  ('Ashoka University',         'Sonipat',     'Haryana',      'university'),
  ('Plaksha University',        'Mohali',      'Punjab',       'university'),
  ('Krea University',           'Sri City',    'Andhra Pradesh','university'),
  ('SP Jain Institute',         'Mumbai',      'Maharashtra',  'business school'),
  ('FMS Delhi',                 'New Delhi',   'Delhi',        'business school'),
  ('XLRI Jamshedpur',           'Jamshedpur',  'Jharkhand',    'business school'),
  ('NIT Trichy',                'Tiruchirappalli','Tamil Nadu','institute'),
  ('NIT Surathkal',             'Surathkal',   'Karnataka',    'institute'),
  ('NIT Warangal',              'Warangal',    'Telangana',    'institute')
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Domain allowlist. citext makes these case-insensitive.
-- ----------------------------------------------------------------------------
insert into college_domains (domain, college_id) values
  -- IITs
  ('iitb.ac.in',          (select id from colleges where name = 'IIT Bombay'         limit 1)),
  ('iitd.ac.in',          (select id from colleges where name = 'IIT Delhi'          limit 1)),
  ('iitm.ac.in',          (select id from colleges where name = 'IIT Madras'         limit 1)),
  ('iitk.ac.in',          (select id from colleges where name = 'IIT Kanpur'         limit 1)),
  ('iitkgp.ac.in',        (select id from colleges where name = 'IIT Kharagpur'      limit 1)),
  ('iitr.ac.in',          (select id from colleges where name = 'IIT Roorkee'        limit 1)),
  ('iitg.ac.in',          (select id from colleges where name = 'IIT Guwahati'       limit 1)),
  ('iith.ac.in',          (select id from colleges where name = 'IIT Hyderabad'      limit 1)),
  ('iitbhu.ac.in',        (select id from colleges where name = 'IIT BHU Varanasi'   limit 1)),
  -- IIMs
  ('iima.ac.in',          (select id from colleges where name = 'IIM Ahmedabad'      limit 1)),
  ('iimb.ac.in',          (select id from colleges where name = 'IIM Bangalore'      limit 1)),
  ('iimcal.ac.in',        (select id from colleges where name = 'IIM Calcutta'       limit 1)),
  ('iiml.ac.in',          (select id from colleges where name = 'IIM Lucknow'        limit 1)),
  ('iimk.ac.in',          (select id from colleges where name = 'IIM Kozhikode'      limit 1)),
  ('iimidr.ac.in',        (select id from colleges where name = 'IIM Indore'         limit 1)),
  -- Design
  ('nid.edu',             (select id from colleges where name = 'NID Ahmedabad'      limit 1)),
  ('srishti.ac.in',       (select id from colleges where name = 'Srishti Institute'  limit 1)),
  ('pearlacademy.com',    (select id from colleges where name = 'Pearl Academy'      limit 1)),
  -- Law
  ('nls.ac.in',           (select id from colleges where name = 'NLSIU Bangalore'    limit 1)),
  ('nalsar.ac.in',        (select id from colleges where name = 'NALSAR Hyderabad'   limit 1)),
  ('nludelhi.ac.in',      (select id from colleges where name = 'NLU Delhi'          limit 1)),
  -- Universities / colleges
  ('lsr.du.ac.in',        (select id from colleges where name = 'Lady Shri Ram College'     limit 1)),
  ('ststephens.edu',      (select id from colleges where name = 'St Stephen''s College'     limit 1)),
  ('hinducollege.ac.in',  (select id from colleges where name = 'Hindu College'             limit 1)),
  ('hansrajcollege.ac.in',(select id from colleges where name = 'Hansraj College'           limit 1)),
  ('mirandahouse.ac.in',  (select id from colleges where name = 'Miranda House'             limit 1)),
  ('srcc.edu',            (select id from colleges where name = 'Sri Ram College of Commerce' limit 1)),
  ('xaviers.edu',         (select id from colleges where name = 'St Xavier''s College Mumbai' limit 1)),
  ('christuniversity.in', (select id from colleges where name = 'Christ University'         limit 1)),
  ('symbiosis.ac.in',     (select id from colleges where name = 'Symbiosis International University' limit 1)),
  ('manipal.edu',         (select id from colleges where name = 'Manipal Institute of Technology' limit 1)),
  ('vit.ac.in',           (select id from colleges where name = 'VIT Vellore'               limit 1)),
  ('pilani.bits-pilani.ac.in',(select id from colleges where name = 'BITS Pilani'           limit 1)),
  ('ashoka.edu.in',       (select id from colleges where name = 'Ashoka University'         limit 1)),
  ('plaksha.edu.in',      (select id from colleges where name = 'Plaksha University'        limit 1)),
  ('krea.edu.in',         (select id from colleges where name = 'Krea University'           limit 1)),
  ('spjimr.org',          (select id from colleges where name = 'SP Jain Institute'         limit 1)),
  ('fms.edu',             (select id from colleges where name = 'FMS Delhi'                 limit 1)),
  ('xlri.ac.in',           (select id from colleges where name = 'XLRI Jamshedpur'          limit 1)),
  ('nitt.edu',            (select id from colleges where name = 'NIT Trichy'                limit 1)),
  ('nitk.edu.in',         (select id from colleges where name = 'NIT Surathkal'             limit 1)),
  ('nitw.ac.in',          (select id from colleges where name = 'NIT Warangal'              limit 1))
on conflict (domain) do nothing;


-- ============================================================
-- 0004_notification_log.sql
-- ============================================================
-- ============================================================================
-- Stuviora — notification_log (P5, needed early for P1 query branching)
-- ----------------------------------------------------------------------------
-- Append-only audit of every notification we send. Used by:
--   - getTodaysMatchEmailCount(student_id) to enforce the 3-emails/day cap
--     for match digests (master plan section 4: "3-emails/student/day cap")
--   - The reconciler that detects email-delivery drift
--   - The user-facing settings page to show "you have N alerts this week"
-- ============================================================================

create type notification_kind as enum (
  'match_email',
  'order_update',
  'weekly_digest',
  'ai_gate_result',
  'dispute_event',
  'payout_settled',
  'tier_upgraded',
  'marketing'
);

create type notification_channel as enum ('email', 'push', 'inapp', 'whatsapp');

create table notification_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  kind         notification_kind not null,
  channel      notification_channel not null default 'email',
  subject      text,
  payload      jsonb,                      -- whatever shape the template needs
  related_id   uuid,                       -- order_id, job_id, dispute_id, etc.
  sent_at      timestamptz not null default now()
);

-- Composite index that supports the daily-cap lookup:
--   SELECT count(*) FROM notification_log
--   WHERE user_id = ? AND kind = 'match_email' AND sent_at >= now() - interval '24h'
create index idx_notification_log_user_kind_sent
  on notification_log (user_id, kind, sent_at desc);

-- Quick RLS: a user can read their own notifications; only the service
-- role inserts. (The 0002 RLS migration patterned this same way for
-- other user-scoped tables.)
alter table notification_log enable row level security;

create policy notification_log_read_own
  on notification_log for select
  using (auth.uid() = user_id);

-- INSERT/DELETE intentionally have no policy: writes happen only via
-- service-role from Inngest workers + Server Actions.


-- ============================================================
-- 0005_storage_buckets.sql
-- ============================================================
-- ============================================================================
-- Stuviora — storage buckets (P2)
-- ----------------------------------------------------------------------------
-- Four buckets back the file flows:
--   portfolio          public-read, write via signed-upload from student profile
--   submissions        private; service-role writes from /submit, signed reads
--                      for the AI gate worker + client view + admin
--   dispute_evidence   private; service-role writes; signed reads for parties + admin
--   gst_invoices       private; service-role writes; signed reads for the order's
--                      client only
--
-- We declare buckets via the storage.buckets API. Storage RLS policies
-- below cover the read paths. Writes always go through the service role
-- (lib/storage/files.ts) so the migration does NOT grant authenticated
-- insert/update on these buckets.
-- ============================================================================

insert into storage.buckets (id, name, public) values
  ('portfolio',         'portfolio',         true),   -- public reads, written via signed POST
  ('submissions',       'submissions',       false),
  ('dispute_evidence',  'dispute_evidence',  false),
  ('gst_invoices',      'gst_invoices',      false)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Storage RLS policies
-- ----------------------------------------------------------------------------

-- portfolio: public read (bucket is `public=true` so this is the default).
-- No insert/update policies => writes are service-role only.

-- submissions: a student can read their own submission objects (objects
-- are stored at `<order_id>/<filename>`; we keep the join in app code).
-- Clients see submissions through the order detail page, which fetches
-- via signed URLs minted by the server using the service role. Admins
-- see all via service role. RLS therefore is permissive for read of own
-- files (matched by inferring student_id from auth) and otherwise
-- forbids direct reads.
create policy if not exists submissions_read_own
  on storage.objects for select
  using (
    bucket_id = 'submissions'
    and (
      -- objects path is <order_id>/<file>; we cannot resolve order
      -- ownership from path alone, so the policy keeps reads server-
      -- mediated via signed URLs.
      auth.role() = 'service_role'
    )
  );

-- dispute_evidence: same pattern as submissions.
create policy if not exists dispute_evidence_read_service
  on storage.objects for select
  using (
    bucket_id = 'dispute_evidence' and auth.role() = 'service_role'
  );

-- gst_invoices: client of the order, surfaced via signed URL. The
-- policy keeps direct read off-limits unless minted by service role.
create policy if not exists gst_invoices_read_service
  on storage.objects for select
  using (
    bucket_id = 'gst_invoices' and auth.role() = 'service_role'
  );


-- ============================================================
-- 0006_consent_log.sql
-- ============================================================
-- ============================================================================
-- Stuviora — consent_log + account_deletion_requests (P7 / DPDP)
-- ----------------------------------------------------------------------------
-- DPDP Act 2023 (Rules notified 2025-11-13; substantive duties from
-- 2027-05-13) requires an auditable record of consent and a path to
-- erase data. These tables back app/actions/privacy.ts.
-- ============================================================================

-- Append-only audit of consent captured from each user. We never update a
-- row; a consent change writes a new row, so the history is preserved.
create table consent_log (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  -- One JSON object: { essential, analytics, marketing_email, match_notifications }
  state          jsonb not null,
  notice_version text not null,
  source         text,                      -- 'banner', 'settings', 'signup'
  recorded_at    timestamptz not null default now()
);

create index idx_consent_log_user_recorded
  on consent_log (user_id, recorded_at desc);

alter table consent_log enable row level security;

-- A user can read their own consent history; writes happen via service role
-- from the Server Actions.
create policy consent_log_read_own
  on consent_log for select
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Account deletion (right to erasure). We record the request and process it
-- on a grace timer rather than deleting inline, so an accidental request can
-- be cancelled and in-flight orders/payouts can settle first.
-- ----------------------------------------------------------------------------
create type deletion_status as enum ('requested', 'cancelled', 'processed');

create table account_deletion_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  status        deletion_status not null default 'requested',
  reason        text,
  requested_at  timestamptz not null default now(),
  -- Erasure runs after this time unless cancelled (grace window).
  scheduled_for timestamptz not null default (now() + interval '7 days'),
  processed_at  timestamptz
);

create unique index uniq_active_deletion_per_user
  on account_deletion_requests (user_id)
  where status = 'requested';

alter table account_deletion_requests enable row level security;

create policy deletion_req_read_own
  on account_deletion_requests for select
  using (auth.uid() = user_id);


-- ============================================================
-- 0007_university_partners.sql
-- ============================================================
-- ============================================================================
-- Stuviora — university_partners (P9.4)
-- ----------------------------------------------------------------------------
-- B2B partners (university placement cells) that call the signed
-- /api/v1/university/* endpoints. Each partner has an API key id and a
-- shared HMAC secret. Requests are verified by lib/partners/hmac.ts.
--
-- SECURITY: `secret` is the shared HMAC key. In production it must be
-- stored encrypted (Supabase Vault) and decrypted in the registry, not
-- kept in plaintext. Left plain here with this flag for the P7 Vault pass.
-- ============================================================================

create table university_partners (
  key_id        text primary key,
  secret        text not null,
  partner_name  text not null,
  college       text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  revoked_at    timestamptz
);

create index idx_university_partners_active
  on university_partners (active)
  where active = true;

alter table university_partners enable row level security;

-- No policies: this table is read + written only via the service role
-- (the route guard and the admin issue/revoke flow). The anon/auth roles
-- never see partner secrets.


-- ============================================================
-- 0008_university_portal.sql
-- ============================================================
-- ============================================================================
-- Stuviora — university portal (P9)
-- ----------------------------------------------------------------------------
-- Lets placement-cell staff log in (role 'university') scoped to one
-- college, on top of the HMAC B2B API from 0007. Adds:
--   - a member -> partner/college mapping for portal auth
--   - an invite code on the partner for student attribution
--   - a student opt-in flag for the share-with-college roster
-- ============================================================================

-- Portal users for a partner. A 'university'-role user in `users` maps to
-- exactly one college + partner credential.
create table university_members (
  user_id       uuid primary key references users(id) on delete cascade,
  key_id        text not null references university_partners(key_id) on delete cascade,
  college       text not null,
  contact_email text,
  created_at    timestamptz not null default now()
);

create index idx_university_members_key on university_members (key_id);

alter table university_members enable row level security;

-- A member can read their own mapping; writes are service-role only.
create policy university_members_read_own
  on university_members for select
  using (auth.uid() = user_id);

-- Invite code on the partner, for college-attributed student signups.
alter table university_partners
  add column if not exists invite_code text unique;

-- Student opt-in: when true, the student appears individually in their
-- college's roster. Default false (consent is opt-in, per DPDP).
alter table student_profiles
  add column if not exists share_with_college boolean not null default false;


-- ============================================================
-- 0009_monetization_teams.sql
-- ============================================================
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


-- ============================================================
-- 0010_sprint5b.sql
-- ============================================================
-- ============================================================================
-- Stuviora — audit Sprint 5b (saved jobs, templates, blocks, appeals)
-- ============================================================================

-- #40 saved jobs (bulk-shortlist).
create table saved_jobs (
  student_id uuid not null references users(id) on delete cascade,
  job_id     uuid not null references jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, job_id)
);
alter table saved_jobs enable row level security;
create policy saved_jobs_own on saved_jobs
  for all using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- #43 proposal templates.
create table proposal_templates (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references users(id) on delete cascade,
  label      text not null,
  body       text not null,
  created_at timestamptz not null default now()
);
create index idx_proposal_templates_student on proposal_templates (student_id);
alter table proposal_templates enable row level security;
create policy proposal_templates_own on proposal_templates
  for all using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- #56 block client: hides the client's jobs from this student's feeds.
create table blocked_clients (
  student_id uuid not null references users(id) on delete cascade,
  client_id  uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, client_id)
);
alter table blocked_clients enable row level security;
create policy blocked_clients_own on blocked_clients
  for all using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- #55 dispute appeal: a resolved dispute may be appealed once within 7
-- days; the appeal reopens it into admin review.
alter table dispute_cases
  add column if not exists appealed_at timestamptz;


-- ============================================================
-- 0011_calibration_log.sql
-- ============================================================
-- ============================================================================
-- Stuviora — ai_calibration_log (the data moat)
-- ----------------------------------------------------------------------------
-- One row per AI-gate decision, labeled later with the human outcome
-- (approval / revision / dispute result). This dataset is what keeps the
-- gate calibrated and is intentionally append-only.
-- ============================================================================

create table ai_calibration_log (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid references orders(id) on delete set null,
  score          numeric(5,2) not null,
  verdict        text not null check (verdict in ('PASS','FAIL')),
  prompt_version text not null,
  decided_at     timestamptz not null default now(),
  outcome        text check (outcome in (
    'approved','revision_requested','dispute_client_favour',
    'dispute_student_favour','dispute_partial')),
  outcome_at     timestamptz
);

create index idx_calibration_order on ai_calibration_log (order_id);
create index idx_calibration_unlabeled on ai_calibration_log (decided_at)
  where outcome is null;

alter table ai_calibration_log enable row level security;
-- Service-role only: no anon/auth policies. Workers write, ops reads.


-- ============================================================
-- 0012_admin_reports.sql
-- ============================================================
-- ============================================================================
-- Stuviora — admin_reports (audit #61 report-this-user) + skill badges (#11)
-- ============================================================================

create table admin_reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references users(id) on delete cascade,
  target_name text not null,
  context     text not null,          -- 'profile' | 'message' | 'order'
  reason      text not null,
  status      text not null default 'open',  -- open | reviewed | actioned
  created_at  timestamptz not null default now()
);
create index idx_admin_reports_status on admin_reports (status);
alter table admin_reports enable row level security;
-- Reporters may read their own reports; admin reads via service role.
create policy admin_reports_read_own on admin_reports
  for select using (auth.uid() = reporter_id);

-- #11: verified skill badges earned by passing the assessment.
create table skill_badges (
  student_id    uuid not null references users(id) on delete cascade,
  category_slug text not null,
  score         integer not null,
  earned_at     timestamptz not null default now(),
  primary key (student_id, category_slug)
);
alter table skill_badges enable row level security;
create policy skill_badges_read on skill_badges for select using (true);

-- Outbound milestone webhooks: where to deliver signed partner events.
alter table university_partners
  add column if not exists webhook_url text;

