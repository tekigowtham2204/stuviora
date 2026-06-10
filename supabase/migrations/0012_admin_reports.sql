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
