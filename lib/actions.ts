"use server"

import { revalidatePath } from "next/cache"
import { nanoid } from "nanoid"
import { query, withConnection } from "@/lib/db"
import { createClient } from "@/lib/supabase/server"
import { moderateCouplet } from "@/lib/ai-moderation"
import type { Contribution } from "@/lib/mock-data"
import type { CampaignInput, CampaignResult } from "@/lib/actions-types"
import {
  getAllContributions,
  getAuthors,
  type GetContributionsOptions,
  type GetAuthorsOptions,
  type PagedResult,
} from "@/lib/queries"
import type { Author } from "@/lib/mock-data"

const VERSE_MAX = 100
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface SubmitResult {
  ok: boolean
  error?: string
  /** Resulting moderation status of a public submission, when applicable. */
  status?: Contribution["status"]
}

/**
 * Public action: a visitor submits a two-line couplet to a campaign.
 * Creates/links an author, then inserts a pending contribution.
 * No auth required — but server-side validation is enforced.
 */
export async function submitContribution(input: {
  campaignId: string
  fullName: string
  email: string
  country?: string | null
  lineOne: string
  lineTwo: string
  consent: boolean
  /** True when the caller already completed the inline OTP verification step. */
  emailVerified?: boolean
}): Promise<SubmitResult> {
  const fullName = input.fullName?.trim()
  const email = input.email?.trim().toLowerCase()
  const lineOne = input.lineOne?.trim()
  const lineTwo = input.lineTwo?.trim()

  // Server-side validation (never trust the client).
  if (!fullName) return { ok: false, error: "Please provide your name." }
  if (!email || !EMAIL_RE.test(email))
    return { ok: false, error: "Please provide a valid email address." }
  if (!lineOne || !lineTwo)
    return { ok: false, error: "Both lines are required." }
  if (lineOne.length > VERSE_MAX || lineTwo.length > VERSE_MAX)
    return { ok: false, error: `Each line must be under ${VERSE_MAX} characters.` }
  if (!input.consent)
    return { ok: false, error: "Please accept the terms to continue." }

  // Confirm the campaign exists and is currently open.
  const { rows: campaignRows } = await query<{
    id: string
    slug: string
    status: string
    start_date: Date
    close_date: Date
    title: string
    theme: string
    description: string
    ai_moderation: boolean
    ai_level: "lenient" | "standard" | "strict"
    require_email_verification: boolean
  }>(
    `SELECT id, slug, status, start_date, close_date, title, theme, description,
            ai_moderation, ai_level, require_email_verification
       FROM campaigns WHERE id = $1`,
    [input.campaignId],
  )
  const campaign = campaignRows[0]
  if (!campaign) return { ok: false, error: "Campaign not found." }

  const now = Date.now()
  const open =
    campaign.status === "active" &&
    now >= new Date(campaign.start_date).getTime() &&
    now <= new Date(campaign.close_date).getTime()
  if (!open)
    return { ok: false, error: "This campaign is not currently accepting submissions." }

  // Run AI auto-moderation (AWS Bedrock) when enabled for this campaign.
  //
  // Decision outcomes:
  //   publish → approved as submitted
  //   curate  → approved with AI-rewritten lines
  //   manual  → pending for a human moderator
  //
  // Any AI failure automatically falls back to manual (pending).
  let initialStatus: Contribution["status"] = "pending"
  let moderationReason: string | null = null

  // lineOne/lineTwo may be replaced by AI-curated versions before insert.
  let finalLineOne = lineOne
  let finalLineTwo = lineTwo

  if (campaign.ai_moderation) {
    // Fetch the last two approved couplets to give the AI poem context.
    const { rows: prevRows } = await query<{
      line_one: string
      line_two: string
    }>(
      `SELECT line_one, line_two
         FROM contributions
        WHERE campaign_id = $1 AND status = 'approved'
        ORDER BY sequence_number DESC
        LIMIT 2`,
      [input.campaignId],
    )
    // Return them in ascending order so the AI reads them chronologically.
    const previousCouplets = prevRows
      .reverse()
      .map((r) => ({ lineOne: r.line_one, lineTwo: r.line_two }))

    const verdict = await moderateCouplet({
      lineOne,
      lineTwo,
      level: campaign.ai_level,
      campaignTitle: campaign.title,
      campaignTheme: campaign.theme,
      campaignDescription: campaign.description,
      previousCouplets,
    })

    if (verdict.decision === "publish") {
      initialStatus = "approved"
      moderationReason = `AI (${campaign.ai_level}): ${verdict.reason}`
    } else if (verdict.decision === "curate") {
      initialStatus = "approved"
      // Use the AI-curated lines instead of the raw submission.
      finalLineOne = verdict.curatedLineOne ?? lineOne
      finalLineTwo = verdict.curatedLineTwo ?? lineTwo
      moderationReason = `AI curated (${campaign.ai_level}): ${verdict.reason}`
    } else {
      // manual (or fallback) — leave as pending for a human moderator.
      initialStatus = "pending"
      moderationReason = verdict.fallback
        ? `AI unavailable: ${verdict.reason}`
        : `AI flagged for manual review (${campaign.ai_level}): ${verdict.reason}`
    }
  }

  try {
    await withConnection(async (client) => {
      // Upsert the author by email.
      const authorId = `aut_${nanoid(12)}`
      const { rows: authorRows } = await client.query<{
        id: string
        status: string
      }>(
        `INSERT INTO authors (id, name, email, country, status)
         VALUES ($1, $2, $3, $4, 'active')
         ON CONFLICT (email) DO UPDATE
           SET name = COALESCE(EXCLUDED.name, authors.name),
               country = COALESCE(EXCLUDED.country, authors.country)
         RETURNING id, status`,
        [authorId, fullName, email, input.country ?? null],
      )
      const author = authorRows[0]
      if (author.status === "banned") {
        throw new Error("banned")
      }

      // If email verification is required but the OTP has NOT been verified yet,
      // hold as pending. If OTP was already verified (inline flow), trust the
      // AI moderation decision directly.
      const statusForDb =
        campaign.require_email_verification && !input.emailVerified
          ? "pending"
          : initialStatus

      const contributionId = `ctr_${nanoid(12)}`

      // Approved submissions (publish or curate) get the next sequence number.
      if (statusForDb === "approved") {
        await client.query(
          `INSERT INTO contributions
             (id, campaign_id, sequence_number, line_one, line_two, author_id,
              status, moderation_reason, email_verified)
           VALUES ($1, $2,
             COALESCE((SELECT MAX(sequence_number) FROM contributions
                        WHERE campaign_id = $2 AND status = 'approved'), 0) + 1,
             $3, $4, $5, 'approved', $6, $7)`,
          [
            contributionId,
            input.campaignId,
            finalLineOne,
            finalLineTwo,
            author.id,
            moderationReason,
            !campaign.require_email_verification || Boolean(input.emailVerified), // email_verified
          ],
        )
      } else {
        // pending — queued for manual moderation or email verification.
        await client.query(
          `INSERT INTO contributions
             (id, campaign_id, sequence_number, line_one, line_two, author_id,
              status, moderation_reason, email_verified)
           VALUES ($1, $2, 0, $3, $4, $5, $6, $7, $8)`,
          [
            contributionId,
            input.campaignId,
            finalLineOne,
            finalLineTwo,
            author.id,
            statusForDb,
            moderationReason,
            !campaign.require_email_verification || Boolean(input.emailVerified),
          ],
        )
      }
    })
  } catch (err) {
    if (err instanceof Error && err.message === "banned") {
      return {
        ok: false,
        error: "This account is not permitted to submit contributions.",
      }
    }
    console.log("[v0] submitContribution error:", err)
    return {
      ok: false,
      error: "Something went wrong while saving your lines. Please try again.",
    }
  }

  revalidatePath(`/campaign/${campaign.slug}`)
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/contributions")
  return { ok: true, status: initialStatus }
}

// ----------------------------------------------------------------------------
// Admin-only actions (require an authenticated Supabase session).
// ----------------------------------------------------------------------------

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  return user
}

/**
 * Moderate a contribution. Approving assigns the next sequence number within
 * the campaign so the poem stays correctly ordered.
 */
export async function moderateContribution(input: {
  id: string
  status: Contribution["status"]
  reason?: string | null
}): Promise<SubmitResult> {
  try {
    await requireAdmin()
  } catch {
    return { ok: false, error: "You must be signed in to moderate." }
  }

  try {
    await withConnection(async (client) => {
      // Single JOIN fetches contribution + campaign + author data in one round-trip.
      const { rows } = await client.query<{
        campaign_id: string
        author_id: string
        slug: string
        title: string
        auto_email_on_publish: boolean
        author_email: string
      }>(
        `SELECT c.campaign_id, c.author_id,
                ca.slug, ca.title, ca.auto_email_on_publish,
                a.email AS author_email
         FROM contributions c
         JOIN campaigns ca ON ca.id = c.campaign_id
         JOIN authors   a  ON a.id  = c.author_id
         WHERE c.id = $1`,
        [input.id],
      )
      const row = rows[0]
      if (!row) throw new Error("not found")

      // Map to named locals so the rest of the function reads clearly.
      const contribution = { campaign_id: row.campaign_id, author_id: row.author_id }
      const campaign = { slug: row.slug, title: row.title, auto_email_on_publish: row.auto_email_on_publish }
      const author = { email: row.author_email }

      if (input.status === "approved") {
        // Assign the next sequence number for this campaign's poem.
        await client.query(
          `UPDATE contributions
             SET status = 'approved',
                 moderation_reason = $2,
                 sequence_number = COALESCE(
                   (SELECT MAX(sequence_number) FROM contributions
                     WHERE campaign_id = $3 AND status = 'approved'), 0) + 1
           WHERE id = $1`,
          [input.id, input.reason ?? null, contribution.campaign_id],
        )

        // Send publish confirmation email if auto_email_on_publish is enabled
        if (campaign?.auto_email_on_publish && author?.email) {
          try {
            await sendPublishConfirmationEmail({
              contributionId: input.id,
              authorEmail: author.email,
              campaignTitle: campaign.title,
              campaignSlug: campaign.slug,
            })
          } catch {
            // non-fatal — contribution is approved regardless of email failure
          }
        }
      } else {
        // Rejecting or requeuing drops it out of the ordered poem.
        await client.query(
          `UPDATE contributions
             SET status = $2, moderation_reason = $3, sequence_number = 0
           WHERE id = $1`,
          [input.id, input.status, input.reason ?? null],
        )
      }
    })
  } catch {
    return { ok: false, error: "Could not update this contribution." }
  }

  // Revalidate the campaign page and moderation queue
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/contributions")
  // Revalidate all dynamic campaign pages
  revalidatePath("/campaign/[slug]")
  return { ok: true }
}

/** Toggle an author's banned/active status. */
export async function setAuthorStatus(input: {
  id: string
  status: "active" | "banned"
}): Promise<SubmitResult> {
  try {
    await requireAdmin()
  } catch {
    return { ok: false, error: "You must be signed in." }
  }

  try {
    await query(`UPDATE authors SET status = $2 WHERE id = $1`, [
      input.id,
      input.status,
    ])
  } catch (err) {
    console.log("[v0] setAuthorStatus error:", err)
    return { ok: false, error: "Could not update this author." }
  }

  revalidatePath("/dashboard/authors")
  return { ok: true }
}

/** Update per-campaign moderation settings. */
export async function updateModerationSettings(input: {
  campaignId: string
  level: "lenient" | "standard" | "strict"
  profanityFilter: boolean
  enforceTheme: boolean
  confidenceThreshold: number
}): Promise<SubmitResult> {
  try {
    await requireAdmin()
  } catch {
    return { ok: false, error: "You must be signed in." }
  }

  try {
    await query(
      `INSERT INTO moderation_settings
         (id, campaign_id, level, profanity_filter, enforce_theme, confidence_threshold, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       ON CONFLICT (campaign_id) DO UPDATE
         SET level = EXCLUDED.level,
             profanity_filter = EXCLUDED.profanity_filter,
             enforce_theme = EXCLUDED.enforce_theme,
             confidence_threshold = EXCLUDED.confidence_threshold,
             updated_at = now()`,
      [
        `mds_${nanoid(10)}`,
        input.campaignId,
        input.level,
        input.profanityFilter,
        input.enforceTheme,
        input.confidenceThreshold,
      ],
    )
  } catch (err) {
    console.log("[v0] updateModerationSettings error:", err)
    return { ok: false, error: "Could not save settings." }
  }

  revalidatePath("/dashboard/settings")
  return { ok: true }
}

/** Edit the two lines of a contribution without changing author or status. */
export async function editContribution(input: {
  id: string
  lineOne: string
  lineTwo: string
}): Promise<SubmitResult> {
  try {
    await requireAdmin()
  } catch {
    return { ok: false, error: "You must be signed in." }
  }

  const lineOne = input.lineOne?.trim()
  const lineTwo = input.lineTwo?.trim()
  if (!lineOne || !lineTwo)
    return { ok: false, error: "Both lines are required." }
  if (lineOne.length > VERSE_MAX || lineTwo.length > VERSE_MAX)
    return { ok: false, error: `Each line must be under ${VERSE_MAX} characters.` }

  try {
    await query(
      `UPDATE contributions SET line_one = $2, line_two = $3 WHERE id = $1`,
      [input.id, lineOne, lineTwo],
    )
  } catch (err) {
    console.log("[v0] editContribution error:", err)
    return { ok: false, error: "Could not save your edits." }
  }

  revalidatePath("/campaign/[slug]")
  revalidatePath("/dashboard/contributions")
  return { ok: true }
}

/** Permanently delete a contribution. */
export async function deleteContribution(id: string): Promise<SubmitResult> {
  try {
    await requireAdmin()
  } catch {
    return { ok: false, error: "You must be signed in." }
  }

  try {
    await query(`DELETE FROM contributions WHERE id = $1`, [id])
  } catch (err) {
    console.log("[v0] deleteContribution error:", err)
    return { ok: false, error: "Could not delete this contribution." }
  }

  // Revalidate campaign pages and moderation views
  revalidatePath("/campaign/[slug]")
  revalidatePath("/dashboard/contributions")
  revalidatePath("/dashboard")
  return { ok: true }
}

/**
 * Internal helper: send a publish confirmation email to a contributor.
 * Not exported as a server action — called directly from moderateContribution.
 */
async function sendPublishConfirmationEmail(input: {
  contributionId: string
  authorEmail: string
  campaignTitle: string
  campaignSlug: string
}): Promise<SubmitResult> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY

  if (!RESEND_API_KEY) {
    return { ok: false, error: "Email service not configured" }
  }

  try {
    const campaignUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/campaign/${input.campaignSlug}`

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "noreply@last2lines.org",
        to: input.authorEmail,
        subject: `Your lines are now in the poem: "${input.campaignTitle}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your Lines Are Published!</h2>
            <p>Congratulations! Your couplet has been approved and is now part of the living poem in <strong>${input.campaignTitle}</strong>.</p>
            <p>
              <a href="${campaignUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1f6f54; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
                Read the Poem
              </a>
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">
              Thank you for contributing to this collective work of poetry.
            </p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] Resend API error:", error)
      return { ok: false, error: "Failed to send confirmation email" }
    }

    // Update the publish_email_sent_at timestamp
    await query(
      `UPDATE contributions SET publish_email_sent_at = now() WHERE id = $1`,
      [input.contributionId],
    )

    return { ok: true }
  } catch (error) {
    console.error("[v0] Send publish confirmation email error:", error)
    return { ok: false, error: "Failed to send confirmation email" }
  }
}

// ----------------------------------------------------------------------------
// Campaign create / update / delete
// ----------------------------------------------------------------------------

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "campaign"
  )
}


/** Create a new campaign. Generates a unique slug from the title. */
export async function createCampaign(
  input: CampaignInput,
): Promise<CampaignResult> {
  try {
    await requireAdmin()
  } catch {
    return { ok: false, error: "You must be signed in." }
  }

  const title = input.title?.trim()
  if (!title) return { ok: false, error: "Title is required." }

  const id = `cmp_${nanoid(12)}`
  // Ensure slug uniqueness with a short suffix.
  const slug = `${slugify(title)}-${nanoid(5).toLowerCase()}`

  try {
    await query(
      `INSERT INTO campaigns
         (id, slug, title, tagline, description, instructions, theme,
          accent_color, status, ai_moderation, ai_level,
          background_image_url, campaign_images, video_link, donation_link,
          require_email_verification, auto_email_on_publish,
          start_date, close_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
               $16, $17, $18, $19, now(), now())`,
      [
        id,
        slug,
        title,
        input.tagline?.trim() ?? "",
        input.description?.trim() ?? "",
        [],
        "general",
        "#1f6f54",
        input.status,
        input.aiModeration,
        input.aiLevel,
        input.backgroundImageUrl?.trim() || "/placeholder.svg?height=900&width=1600",
        [],
        input.videoLink?.trim() || null,
        input.donationLink?.trim() || null,
        input.requireEmailVerification,
        input.autoEmailOnPublish,
        new Date(input.startDate).toISOString(),
        new Date(input.closeDate).toISOString(),
      ],
    )

    // Insert seed couplets if provided
    if (input.seedCouplets && input.seedCouplets.length > 0) {
      for (let i = 0; i < input.seedCouplets.length; i++) {
        const seed = input.seedCouplets[i]
        const seedId = `seed_${nanoid(12)}`
        await query(
          `INSERT INTO seed_couplets (id, campaign_id, sequence_number, line_one, line_two, author, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, now())`,
          [seedId, id, i, seed.lineOne.trim(), seed.lineTwo.trim(), seed.author.trim()],
        )
      }
    }
  } catch (err) {
    console.log("[v0] createCampaign error:", err)
    return { ok: false, error: "Could not create this campaign." }
  }

  revalidatePath("/dashboard/campaigns")
  revalidatePath("/dashboard")
  revalidatePath("/")
  return { ok: true, id }
}

/** Update an existing campaign's editable fields. */
export async function updateCampaign(
  id: string,
  input: CampaignInput,
): Promise<CampaignResult> {
  try {
    await requireAdmin()
  } catch {
    return { ok: false, error: "You must be signed in." }
  }

  const title = input.title?.trim()
  if (!title) return { ok: false, error: "Title is required." }

  try {
    await query(
      `UPDATE campaigns
         SET title = $2, tagline = $3, description = $4, status = $5,
             ai_moderation = $6, ai_level = $7, video_link = $8,
             donation_link = $9, background_image_url = $10,
             require_email_verification = $11, auto_email_on_publish = $12,
             start_date = $13, close_date = $14, updated_at = now()
       WHERE id = $1`,
      [
        id,
        title,
        input.tagline?.trim() ?? "",
        input.description?.trim() ?? "",
        input.status,
        input.aiModeration,
        input.aiLevel,
        input.videoLink?.trim() || null,
        input.donationLink?.trim() || null,
        input.backgroundImageUrl?.trim() || null,
        input.requireEmailVerification,
        input.autoEmailOnPublish,
        new Date(input.startDate).toISOString(),
        new Date(input.closeDate).toISOString(),
      ],
    )

    // Update seed couplets
    // Delete existing seed couplets for this campaign
    await query(`DELETE FROM seed_couplets WHERE campaign_id = $1`, [id])

    // Insert new seed couplets if provided
    if (input.seedCouplets && input.seedCouplets.length > 0) {
      for (let i = 0; i < input.seedCouplets.length; i++) {
        const seed = input.seedCouplets[i]
        const seedId = `seed_${nanoid(12)}`
        await query(
          `INSERT INTO seed_couplets (id, campaign_id, sequence_number, line_one, line_two, author, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, now())`,
          [seedId, id, i, seed.lineOne.trim(), seed.lineTwo.trim(), seed.author.trim()],
        )
      }
    }
  } catch (err) {
    console.log("[v0] updateCampaign error:", err)
    return { ok: false, error: "Could not save changes." }
  }

  revalidatePath(`/dashboard/campaigns/${id}`)
  revalidatePath("/dashboard/campaigns")
  revalidatePath("/dashboard")
  revalidatePath("/")
  return { ok: true, id }
}

/** Permanently delete a campaign and its contributions (cascade). */
export async function deleteCampaign(id: string): Promise<CampaignResult> {
  try {
    await requireAdmin()
  } catch {
    return { ok: false, error: "You must be signed in." }
  }

  try {
    // Child tables (contributions, moderation_settings, seed_couplets, email_otps)
    // all carry ON DELETE CASCADE — a single parent delete is sufficient.
    await query(`DELETE FROM campaigns WHERE id = $1`, [id])
  } catch (err) {
    console.log("[v0] deleteCampaign error:", err)
    return { ok: false, error: "Could not delete this campaign." }
  }

  revalidatePath(`/dashboard/campaigns/${id}`)
  revalidatePath("/dashboard/campaigns")
  revalidatePath("/dashboard")
  revalidatePath("/")
  return { ok: true, id }
}

// ----------------------------------------------------------------------------
// Pagination server actions — thin wrappers so client components can call
// server-only query functions directly.
// ----------------------------------------------------------------------------

/** Fetch a page of contributions. Called by ContributionsTable "Load more". */
export async function fetchContributionsPage(
  opts: GetContributionsOptions,
): Promise<PagedResult<Contribution>> {
  return getAllContributions(opts)
}

/** Fetch a page of authors. Called by AuthorsTable "Load more". */
export async function fetchAuthorsPage(
  opts: GetAuthorsOptions,
): Promise<PagedResult<Author>> {
  return getAuthors(opts)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
