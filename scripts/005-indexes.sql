-- Migration 005: Performance indexes.
-- Run after 004-schema-corrections.sql.
-- All statements are idempotent (IF NOT EXISTS / DROP IF EXISTS before recreate).

-- ---------------------------------------------------------------------------
-- contributions
-- ---------------------------------------------------------------------------

-- Composite for moderation queue: WHERE campaign_id = $1 AND status = $2
CREATE INDEX IF NOT EXISTS idx_contributions_campaign_status
  ON contributions(campaign_id, status);

-- Ordered fetch for moderation queue: ORDER BY created_at DESC (all statuses)
CREATE INDEX IF NOT EXISTS idx_contributions_created_at
  ON contributions(created_at DESC);

-- Composite for per-author history per campaign
CREATE INDEX IF NOT EXISTS idx_contributions_campaign_author
  ON contributions(campaign_id, author_id);

-- Partial: fast MAX(sequence_number) on APPROVE and ordered poem display.
-- Drop the original idx_contributions_poem first (it lacked the partial clause).
DROP INDEX IF EXISTS idx_contributions_poem;
CREATE INDEX IF NOT EXISTS idx_contributions_poem
  ON contributions(campaign_id, sequence_number DESC)
  WHERE status = 'approved';

-- ---------------------------------------------------------------------------
-- authors
-- ---------------------------------------------------------------------------

-- Composite covers: ON CONFLICT (email) upsert + banned-status check in one scan
CREATE INDEX IF NOT EXISTS idx_authors_email_status
  ON authors(email, status);

-- Geography analytics for getContributionsByCountry GROUP BY
CREATE INDEX IF NOT EXISTS idx_authors_country
  ON authors(country)
  WHERE country IS NOT NULL;

-- ---------------------------------------------------------------------------
-- email_otps
-- ---------------------------------------------------------------------------

-- Replace the broad (email, campaign_id) index with a partial that only indexes
-- tokens that are still usable — expired/used rows are never matched at query time.
DROP INDEX IF EXISTS idx_email_otps_email_campaign;
CREATE INDEX IF NOT EXISTS idx_email_otps_active
  ON email_otps(email, campaign_id, expires_at)
  WHERE used = false;
