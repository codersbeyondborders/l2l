-- Phase 3: Aurora PostgreSQL schema for Last 2 Lines
-- Holds all application data. Admin auth lives in Supabase (auth.users).

-- ----------------------------------------------------------------------------
-- campaigns
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  tagline      TEXT NOT NULL DEFAULT '',
  description  TEXT NOT NULL DEFAULT '',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  theme        VARCHAR(50) NOT NULL DEFAULT 'general',
  accent_color VARCHAR(50) NOT NULL DEFAULT 'emerald',
  status       VARCHAR(20) NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft','active','paused','completed','archived')),
  ai_moderation BOOLEAN NOT NULL DEFAULT true,
  ai_level     VARCHAR(20) NOT NULL DEFAULT 'standard'
                 CHECK (ai_level IN ('lenient','standard','strict')),
  background_image_url TEXT NOT NULL DEFAULT '',
  campaign_images TEXT[] NOT NULL DEFAULT '{}',
  video_link    TEXT,
  donation_link TEXT,
  start_date   TIMESTAMPTZ NOT NULL,
  close_date   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);

-- ----------------------------------------------------------------------------
-- authors (public contributors, NOT admins)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS authors (
  id        TEXT PRIMARY KEY,
  name      TEXT,
  email     TEXT NOT NULL UNIQUE,
  country   TEXT,
  status    VARCHAR(20) NOT NULL DEFAULT 'active'
              CHECK (status IN ('active','banned')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_authors_status ON authors(status);

-- ----------------------------------------------------------------------------
-- contributions (two-line couplets)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contributions (
  id               TEXT PRIMARY KEY,
  campaign_id      TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  sequence_number  INT NOT NULL DEFAULT 0,
  line_one         TEXT NOT NULL,
  line_two         TEXT NOT NULL,
  author_id        TEXT NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','approved','rejected')),
  moderation_reason TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contributions_campaign ON contributions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_contributions_author ON contributions(author_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
-- Fast ordered fetch of an approved poem.
CREATE INDEX IF NOT EXISTS idx_contributions_poem
  ON contributions(campaign_id, sequence_number)
  WHERE status = 'approved';

-- ----------------------------------------------------------------------------
-- moderation_settings (per-campaign AI tuning)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS moderation_settings (
  id                   TEXT PRIMARY KEY,
  campaign_id          TEXT NOT NULL UNIQUE REFERENCES campaigns(id) ON DELETE CASCADE,
  level                VARCHAR(20) NOT NULL DEFAULT 'standard'
                         CHECK (level IN ('lenient','standard','strict')),
  profanity_filter     BOOLEAN NOT NULL DEFAULT true,
  enforce_theme        BOOLEAN NOT NULL DEFAULT true,
  confidence_threshold NUMERIC(3,2) NOT NULL DEFAULT 0.70,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
