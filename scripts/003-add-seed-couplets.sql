-- Add seed_couplets table to store initial couplets for campaigns

CREATE TABLE IF NOT EXISTS seed_couplets (
  id             TEXT PRIMARY KEY,
  campaign_id    TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  sequence_number INT NOT NULL DEFAULT 0,
  line_one       TEXT NOT NULL,
  line_two       TEXT NOT NULL,
  author         TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seed_couplets_campaign ON seed_couplets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_seed_couplets_sequence ON seed_couplets(campaign_id, sequence_number);
