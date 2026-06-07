-- ============================================================================
-- Stuviora — storage buckets (P2)
-- ----------------------------------------------------------------------------
-- Four buckets back the file flows:
--   portfolio          public-read, write via signed-upload from student profile
--   submissions        private; service-role writes from /submit, signed reads
--                      for the AI gate worker + client view + admin
--   dispute_evidence   private; service-role writes; signed reads for parties + admin
--   gst_invoices       private; service-role writes; signed reads for the order's
--                      client only
--
-- We declare buckets via the storage.buckets API. Storage RLS policies
-- below cover the read paths. Writes always go through the service role
-- (lib/storage/files.ts) so the migration does NOT grant authenticated
-- insert/update on these buckets.
-- ============================================================================

insert into storage.buckets (id, name, public) values
  ('portfolio',         'portfolio',         true),   -- public reads, written via signed POST
  ('submissions',       'submissions',       false),
  ('dispute_evidence',  'dispute_evidence',  false),
  ('gst_invoices',      'gst_invoices',      false)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Storage RLS policies
-- ----------------------------------------------------------------------------

-- portfolio: public read (bucket is `public=true` so this is the default).
-- No insert/update policies => writes are service-role only.

-- submissions: a student can read their own submission objects (objects
-- are stored at `<order_id>/<filename>`; we keep the join in app code).
-- Clients see submissions through the order detail page, which fetches
-- via signed URLs minted by the server using the service role. Admins
-- see all via service role. RLS therefore is permissive for read of own
-- files (matched by inferring student_id from auth) and otherwise
-- forbids direct reads.
create policy if not exists submissions_read_own
  on storage.objects for select
  using (
    bucket_id = 'submissions'
    and (
      -- objects path is <order_id>/<file>; we cannot resolve order
      -- ownership from path alone, so the policy keeps reads server-
      -- mediated via signed URLs.
      auth.role() = 'service_role'
    )
  );

-- dispute_evidence: same pattern as submissions.
create policy if not exists dispute_evidence_read_service
  on storage.objects for select
  using (
    bucket_id = 'dispute_evidence' and auth.role() = 'service_role'
  );

-- gst_invoices: client of the order, surfaced via signed URL. The
-- policy keeps direct read off-limits unless minted by service role.
create policy if not exists gst_invoices_read_service
  on storage.objects for select
  using (
    bucket_id = 'gst_invoices' and auth.role() = 'service_role'
  );
