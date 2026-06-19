import { type NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { query } from "@/lib/db"

const RESEND_API_KEY = process.env.RESEND_API_KEY

/**
 * Send verification email for a contribution.
 * Called after user submits their couplet if `require_email_verification` is enabled.
 */
export async function POST(request: NextRequest) {
  try {
    const { contributionId, email, campaignTitle } = await request.json()

    if (!contributionId || !email || !campaignTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    if (!RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY not configured")
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 },
      )
    }

    // Generate verification token
    const verificationToken = nanoid(32)

    // Store token in database
    await query(
      `UPDATE contributions
         SET verification_token = $1, verification_sent_at = now()
       WHERE id = $2`,
      [verificationToken, contributionId],
    )

    // Build verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}&id=${contributionId}`

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "noreply@last2lines.org",
        to: email,
        subject: `Verify your submission to "${campaignTitle}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Submission</h2>
            <p>Thank you for contributing to <strong>${campaignTitle}</strong>!</p>
            <p>Please click the link below to verify your email address and complete your submission:</p>
            <p>
              <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #1f6f54; color: white; text-decoration: none; border-radius: 4px;">
                Verify Email
              </a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">
              ${verificationLink}
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">
              This link expires in 24 hours. If you didn't submit this couplet, you can ignore this email.
            </p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] Resend API error:", error)
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, verificationToken })
  } catch (error) {
    console.error("[v0] Send verification email error:", error)
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 },
    )
  }
}
