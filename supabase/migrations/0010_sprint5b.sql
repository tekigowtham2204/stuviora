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
