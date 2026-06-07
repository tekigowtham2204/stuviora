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
