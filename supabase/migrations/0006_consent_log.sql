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
