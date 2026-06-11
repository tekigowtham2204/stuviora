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
