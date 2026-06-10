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
