-- ============================================================================
-- Human-review flag on AI gate results (de-bias the gate).
--
-- The gate must never auto-reject work for "looking AI-written" or for
-- non-native English: AI-detection is unreliable and biased against ESL
-- writers. When originality reads low, or the model is unsure about
-- authorship, we route the delivery to a human instead of failing it. This
-- column records that advisory flag; it never changes the PASS/FAIL verdict.
-- ============================================================================

alter table ai_reviews
  add column if not exists flagged_for_review boolean not null default false;

-- Lets admins pull the human-review queue cheaply.
create index if not exists idx_ai_reviews_flagged
  on ai_reviews(flagged_for_review)
  where flagged_for_review;
