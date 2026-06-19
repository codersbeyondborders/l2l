import { type NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, campaignId, code } = await request.json()

    if (!email || !campaignId || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const codeHash = createHash("sha256").update(String(code).trim()).digest("hex")

    const { rows } = await query<{
      id: string
      expires_at: string
      used: boolean
    }>(
      `SELECT id, expires_at, used
         FROM email_otps
        WHERE email = $1
          AND campaign_id = $2
          AND code_hash = $3
        ORDER BY created_at DESC
        LIMIT 1`,
      [email.toLowerCase().trim(), campaignId, codeHash],
    )

    const otp = rows[0]

    if (!otp) {
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 })
    }

    if (otp.used) {
      return NextResponse.json({ error: "This code has already been used." }, { status: 400 })
    }

    if (new Date(otp.expires_at) < new Date()) {
      return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 })
    }

    // Mark OTP as used
    await query(`UPDATE email_otps SET used = true WHERE id = $1`, [otp.id])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] verify-otp error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
