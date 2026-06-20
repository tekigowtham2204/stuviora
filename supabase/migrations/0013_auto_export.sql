-- ============================================================================
-- Auto-export of delivered work (features.md 2026-06-18), Phase 2 schema.
-- ============================================================================

-- Destinations a student has connected for auto-export. OAuth token material
-- is stored encrypted (PII vault) and only referenced here by token_ref.
create table export_destinations (
  student_id  uuid not null references users(id) on delete cascade,
  destination text not null,            -- 'github' | 'drive' | 'notion' | 'portfolio'
  enabled     boolean not null default true,
  token_ref   text,                     -- encrypted-secret handle, not the token
  created_at  timestamptz not null default now(),
  primary key (student_id, destination)
);
alter table export_destinations enable row level security;
create policy export_destinations_own on export_destinations
  for all using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- Whether the client licensed this order's deliverable for public destinations
-- (the student's public portfolio). Off by default: raw client-owned work
-- never reaches a public destination without this explicit grant.
alter table orders add column if not exists shareable boolean not null default false;
