import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/** One-time migration: creates the email_otps table. Safe to call multiple times. */
export async function POST() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS email_otps (
        id          TEXT PRIMARY KEY,
        email       TEXT NOT NULL,
        campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        code_hash   TEXT NOT NULL,
        expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes'),
        used        BOOLEAN NOT NULL DEFAULT false,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_email_otps_email_campaign
        ON email_otps(email, campaign_id)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_email_otps_expires
        ON email_otps(expires_at)
    `)

    return NextResponse.json({ ok: true, message: "email_otps table ready" })
  } catch (error) {
    console.error("[v0] migrate-otps error:", error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    )
  }
}
