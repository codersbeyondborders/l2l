-- Migration 002: email_otps table for inline OTP verification
-- Stores short-lived 6-digit codes hashed with SHA-256.

CREATE TABLE IF NOT EXISTS email_otps (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  code_hash   TEXT NOT NULL,          -- SHA-256 hex of the plain 6-digit code
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes'),
  used        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_otps_email_campaign
  ON email_otps(email, campaign_id);

CREATE INDEX IF NOT EXISTS idx_email_otps_expires
  ON email_otps(expires_at);
