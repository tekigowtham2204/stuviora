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
