import "server-only"
import { generateText, Output } from "ai"
import { z } from "zod"

/**
 * AI auto-moderation for two-line couplet submissions.
 *
 * Powered by AWS Bedrock (Amazon Nova Micro) through the Vercel AI Gateway.
 *
 * Three-tier decision system:
 *   publish  — lines are perfectly on-theme; publish as-is.
 *   curate   — lines are moderately on-theme; AI rewrites them to fit the poem
 *              and publishes the curated version.
 *   manual   — lines are off-topic, harmful, or unclear; route to a human.
 *
 * Any AI failure automatically falls back to `manual` so no submission is lost.
 */

// Cheapest Bedrock text model available through the Vercel AI Gateway.
const MODEL = "amazon/nova-micro"

export type ModerationLevel = "lenient" | "standard" | "strict"

export interface PreviousCouplet {
  lineOne: string
  lineTwo: string
}

export interface CoupletModerationInput {
  lineOne: string
  lineTwo: string
  level: ModerationLevel
  campaignTitle: string
  campaignTheme: string
  campaignDescription: string
  /** The last two approved couplets in sequence order (for poem context). */
  previousCouplets: PreviousCouplet[]
}

export interface CoupletModerationResult {
  /**
   * publish  — safe and on-theme, use the original lines.
   * curate   — moderately on-theme; curatedLineOne/Two hold the rewritten lines.
   * manual   — not acceptable; needs a human moderator.
   */
  decision: "publish" | "curate" | "manual"
  /** When decision is "curate", these hold the AI-rewritten lines. */
  curatedLineOne: string | null
  curatedLineTwo: string | null
  /** Short human-readable explanation shown to admins (~140 chars). */
  reason: string
  /** True when the model errored and we safely fell back to manual review. */
  fallback: boolean
}

// ---------------------------------------------------------------------------
// Zod schema for structured output
// ---------------------------------------------------------------------------

const ModerationSchema = z.object({
  decision: z
    .enum(["publish", "curate", "manual"])
    .describe(
      [
        "publish = lines are perfectly safe and on-theme — publish as submitted.",
        "curate  = lines are moderately on-theme but need light editing to fit " +
          "the poem's voice and theme — provide curated rewrites.",
        "manual  = lines are off-topic, harmful, spammy, or otherwise " +
          "unacceptable — route to a human moderator.",
      ].join(" "),
    ),
  curatedLineOne: z
    .string()
    .nullable()
    .describe(
      "Rewritten line 1 (max 100 chars). Required when decision is 'curate', null otherwise.",
    ),
  curatedLineTwo: z
    .string()
    .nullable()
    .describe(
      "Rewritten line 2 (max 100 chars). Required when decision is 'curate', null otherwise.",
    ),
  reason: z
    .string()
    .describe("One concise sentence explaining the decision, max ~140 chars."),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function levelGuidance(level: ModerationLevel): string {
  switch (level) {
    case "lenient":
      return (
        "Apply lenient standards: only send to manual review for clear hate speech, " +
        "explicit sexual content, threats, or blatant spam. " +
        "When lines are mildly off-theme but harmless, curate them instead."
      )
    case "strict":
      return (
        "Apply strict standards: curate anything that uses profanity, " +
        "personal insults, vague relevance, or doesn't clearly match the campaign theme. " +
        "Send to manual review for hate speech, harassment, explicit content, spam, or " +
        "personal data."
      )
    case "standard":
    default:
      return (
        "Apply balanced standards: curate lines that are safe but only loosely on-theme. " +
        "Send to manual review for hate speech, harassment, explicit content, spam, or " +
        "clearly off-topic text."
      )
  }
}

function formatPreviousCouplets(couplets: PreviousCouplet[]): string {
  if (couplets.length === 0) return "(This will be the first couplet in the poem.)"
  return couplets
    .map(
      (c, i) =>
        `Couplet ${i + 1}:\n  Line 1: ${c.lineOne}\n  Line 2: ${c.lineTwo}`,
    )
    .join("\n")
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Classify and optionally rewrite a submitted couplet.
 *
 * Never throws — on any failure it returns a safe `manual` fallback so the
 * submission is queued for a human instead of silently lost.
 */
export async function moderateCouplet(
  input: CoupletModerationInput,
): Promise<CoupletModerationResult> {
  const system = [
    "You are an editorial assistant for a public, collaborative poetry campaign.",
    "Contributors submit a two-line couplet (a 'couplet') that is stitched into a shared, growing poem.",
    "Your job is to evaluate each new couplet and decide one of three things:",
    "  1. PUBLISH  — the lines are perfectly safe and fit the poem's theme and voice. Use them as-is.",
    "  2. CURATE   — the lines are safe and broadly relevant but need light editing to better match",
    "                the poem's theme, tone, or continuity. Rewrite them tastefully while preserving",
    "                the contributor's intent. Keep each curated line under 100 characters.",
    "  3. MANUAL   — the lines are unsafe, off-topic, or otherwise unsuitable. A human must review.",
    levelGuidance(input.level),
    "When curating, maintain the contributor's voice and imagery — improve fit, not style.",
    "Respond ONLY with the structured fields requested.",
  ].join("\n")

  const prompt = [
    `Campaign title: ${input.campaignTitle}`,
    `Campaign theme: ${input.campaignTheme}`,
    `Campaign description: ${input.campaignDescription || "(none)"}`,
    "",
    "--- Previous two couplets in the poem (for continuity context) ---",
    formatPreviousCouplets(input.previousCouplets),
    "",
    "--- New submission to evaluate ---",
    `Line 1: ${input.lineOne}`,
    `Line 2: ${input.lineTwo}`,
  ].join("\n")

  try {
    const { experimental_output } = await generateText({
      model: MODEL,
      system,
      prompt,
      experimental_output: Output.object({ schema: ModerationSchema }),
    })

    // Ensure curated lines are present when the decision demands them.
    const curatedLineOne =
      experimental_output.decision === "curate"
        ? (experimental_output.curatedLineOne ?? input.lineOne)
        : null
    const curatedLineTwo =
      experimental_output.decision === "curate"
        ? (experimental_output.curatedLineTwo ?? input.lineTwo)
        : null

    return {
      decision: experimental_output.decision,
      curatedLineOne,
      curatedLineTwo,
      reason: experimental_output.reason,
      fallback: false,
    }
  } catch (err) {
    console.error("[ai-moderation] moderateCouplet error — falling back to manual:", err)
    return {
      decision: "manual",
      curatedLineOne: null,
      curatedLineTwo: null,
      reason: "Automated moderation was unavailable; queued for human review.",
      fallback: true,
    }
  }
}
