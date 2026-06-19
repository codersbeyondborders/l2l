-- Migration 004: Add columns referenced by application code but missing from
-- the original schema. Safe to re-run (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).

-- campaigns: email-flow feature flags
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS require_email_verification BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_email_on_publish      BOOLEAN NOT NULL DEFAULT false;

-- contributions: OTP tracking + publish-email audit trail
ALTER TABLE contributions
  ADD COLUMN IF NOT EXISTS email_verified         BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS publish_email_sent_at  TIMESTAMPTZ;
