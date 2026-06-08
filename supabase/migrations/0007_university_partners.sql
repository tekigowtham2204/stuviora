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
