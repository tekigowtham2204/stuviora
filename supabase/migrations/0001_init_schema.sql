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
