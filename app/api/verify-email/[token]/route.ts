import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

/**
 * Legacy magic-link verification route (kept for any outstanding links).
 * The primary verification flow is now inline OTP via /api/send-otp + /api/verify-otp.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const base = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

  try {
    const { token } = await params

    if (!token) {
      return NextResponse.redirect(
        new URL(
          "/verify-email-result?error=1&message=Invalid+verification+link",
          base,
        ),
      )
    }

    // Find the contribution with this token, join campaign for slug
    const { rows } = await query<{
      id: string
      campaign_slug: string
      email_verified: boolean
    }>(
      `SELECT c.id, camp.slug AS campaign_slug, c.email_verified
         FROM contributions c
         JOIN campaigns camp ON camp.id = c.campaign_id
        WHERE c.verification_token = $1`,
      [token],
    )

    const contribution = rows[0]

    if (!contribution) {
      return NextResponse.redirect(
        new URL(
          "/verify-email-result?error=1&message=Verification+link+not+found+or+expired",
          base,
        ),
      )
    }

    if (contribution.email_verified) {
      return NextResponse.redirect(
        new URL(
          `/verify-email-result?message=Email+already+verified&campaignSlug=${contribution.campaign_slug}`,
          base,
        ),
      )
    }

    // Mark as verified
    await query(
      `UPDATE contributions SET email_verified = true WHERE id = $1`,
      [contribution.id],
    )

    return NextResponse.redirect(
      new URL(
        `/verify-email-result?message=Email+verified+successfully&campaignSlug=${contribution.campaign_slug}`,
        base,
      ),
    )
  } catch (error) {
    console.error("[v0] Email verification error:", error)
    return NextResponse.redirect(
      new URL(
        "/verify-email-result?error=1&message=Failed+to+verify+email",
        base,
      ),
    )
  }
}
