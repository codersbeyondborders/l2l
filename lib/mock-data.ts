// High-fidelity mock data mirroring the Aurora PostgreSQL payload.
// Replaced with real queries in Phase 3.

export type CampaignStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived'
export type ContributionStatus = 'pending' | 'approved' | 'rejected'
export type ModerationLevel = 'lenient' | 'standard' | 'strict'
export type AuthorStatus = 'active' | 'banned'

/** Time-based phase derived from start/close dates (distinct from publication `status`). */
export type CampaignPhase = 'upcoming' | 'active' | 'completed'

export interface Campaign {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  /** Step-by-step guidance shown on the campaign page. */
  instructions: string[]
  theme: string
  accentColor: string
  status: CampaignStatus
  /** When true, the AI auto-moderates submissions. Admin-controlled per campaign. */
  aiModeration: boolean
  aiLevel: ModerationLevel
  contributionCount: number
  /** Primary hero/background image. */
  backgroundImageUrl: string
  /** Additional campaign images. */
  campaignImages: string[]
  videoLink: string | null
  donationLink: string | null
  startDate: string
  closeDate: string
  createdAt: string
  /** When true, contributors must verify their email before submission. */
  requireEmailVerification: boolean
  /** When true, auto-send confirmation email when couplet is published. */
  autoEmailOnPublish: boolean
}

export interface Contribution {
  id: string
  campaignId: string
  sequenceNumber: number
  lineOne: string
  lineTwo: string
  authorId: string
  authorName: string | null
  authorEmail: string
  country: string | null
  status: ContributionStatus
  /** Feedback from the AI moderation pass (or manual note). */
  moderationReason: string | null
  createdAt: string
}

export interface Author {
  id: string
  name: string | null
  email: string
  country: string | null
  status: AuthorStatus
  joinedAt: string
}

export interface ModerationSettings {
  id: string
  campaignId: string
  level: ModerationLevel
  profanityFilter: boolean
  enforceTheme: boolean
  confidenceThreshold: number
  updatedAt: string
}

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp_earth',
    slug: 'two-lines-for-the-earth',
    title: 'Two Lines for the Earth',
    tagline: 'A living poem written by the world, for the world.',
    description:
      'Add exactly two lines to a single, continuously growing poem about our shared home. Every approved couplet is stitched into one endless tapestry of collective hope, grief, and resolve.',
    instructions: [
      'Write exactly two lines of free verse — no more, no less.',
      'Keep each line under 100 characters so it reads cleanly in the poem.',
      'Stay close to the theme of climate and our shared planet.',
      'An AI moderation check reviews every couplet for theme and tone before it joins the poem.',
    ],
    theme: 'climate',
    accentColor: 'emerald',
    status: 'active',
    aiModeration: true,
    aiLevel: 'standard',
    contributionCount: 8,
    backgroundImageUrl:
      '/placeholder.svg?height=600&width=960&query=lush%20green%20forest%20canopy%20from%20above%20with%20misty%20morning%20light',
    campaignImages: [],
    videoLink: 'https://example.com/earth-intro',
    donationLink: 'https://example.com/donate/earth',
    startDate: '2026-05-01T00:00:00.000Z',
    closeDate: '2026-09-30T23:59:59.000Z',
    createdAt: '2026-01-12T09:00:00.000Z',
    requireEmailVerification: false,
    autoEmailOnPublish: false,
  },
  {
    id: 'cmp_water',
    slug: 'rivers-remember',
    title: 'Rivers Remember',
    tagline: 'Two lines for every vanishing waterway.',
    description:
      'A campaign gathering couplets that honor the rivers, lakes, and oceans we are losing — and the ones we can still save.',
    instructions: [
      'Write exactly two lines about a river, lake, or ocean that matters to you.',
      'Keep each line under 100 characters.',
      'Center water, memory, and renewal in your imagery.',
      'Every submission passes an AI moderation check before publication.',
    ],
    theme: 'water',
    accentColor: 'emerald',
    status: 'draft',
    aiModeration: true,
    aiLevel: 'strict',
    contributionCount: 0,
    backgroundImageUrl:
      '/placeholder.svg?height=600&width=960&query=winding%20river%20through%20a%20green%20valley%20at%20dawn',
    campaignImages: [],
    videoLink: null,
    donationLink: 'https://example.com/donate/water',
    startDate: '2026-07-15T00:00:00.000Z',
    closeDate: '2026-11-30T23:59:59.000Z',
    createdAt: '2026-05-28T13:30:00.000Z',
    requireEmailVerification: false,
    autoEmailOnPublish: false,
  },
  {
    id: 'cmp_forests',
    slug: 'last-canopy',
    title: 'The Last Canopy',
    tagline: "Couplets for the world's forests.",
    description:
      'A completed seasonal campaign celebrating the forests and the people who defend them.',
    instructions: [
      'Write exactly two lines in honor of a forest or the people who protect it.',
      'Keep each line under 100 characters.',
      'Evoke canopy, root, and the quiet work of conservation.',
      'All couplets were reviewed by an AI moderation pass before joining the poem.',
    ],
    theme: 'forests',
    accentColor: 'emerald',
    status: 'completed',
    aiModeration: false,
    aiLevel: 'lenient',
    contributionCount: 142,
    backgroundImageUrl:
      '/placeholder.svg?height=600&width=960&query=ancient%20tall%20forest%20trees%20with%20sunlight%20streaming%20through',
    campaignImages: [],
    videoLink: 'https://example.com/canopy',
    donationLink: null,
    startDate: '2025-09-01T00:00:00.000Z',
    closeDate: '2025-12-15T23:59:59.000Z',
    createdAt: '2025-09-01T08:00:00.000Z',
    requireEmailVerification: false,
    autoEmailOnPublish: false,
  },
]

// The flagship campaign powers the public-facing landing page.
export const FLAGSHIP_CAMPAIGN: Campaign = MOCK_CAMPAIGNS[0]

export const MOCK_AUTHORS: Author[] = [
  {
    id: 'aut_maya',
    name: 'Maya R.',
    email: 'maya@example.com',
    country: 'Canada',
    status: 'active',
    joinedAt: '2026-05-30T08:00:00.000Z',
  },
  {
    id: 'aut_tomas',
    name: 'Tomás',
    email: 'tomas@example.com',
    country: 'Brazil',
    status: 'active',
    joinedAt: '2026-05-31T10:00:00.000Z',
  },
  {
    id: 'aut_anon',
    name: null,
    email: 'anon@example.com',
    country: 'Australia',
    status: 'active',
    joinedAt: '2026-06-01T12:00:00.000Z',
  },
  {
    id: 'aut_lena',
    name: 'Lena K.',
    email: 'lena@example.com',
    country: 'Germany',
    status: 'active',
    joinedAt: '2026-06-02T09:00:00.000Z',
  },
  {
    id: 'aut_priya',
    name: 'Priya',
    email: 'priya@example.com',
    country: 'India',
    status: 'active',
    joinedAt: '2026-06-03T07:00:00.000Z',
  },
  {
    id: 'aut_spam',
    name: 'promo_bot',
    email: 'spam@example.com',
    country: null,
    status: 'banned',
    joinedAt: '2026-06-05T09:00:00.000Z',
  },
  {
    id: 'aut_sven',
    name: 'Sven',
    email: 'sven@example.com',
    country: 'Norway',
    status: 'active',
    joinedAt: '2026-06-10T16:00:00.000Z',
  },
  {
    id: 'aut_amara',
    name: 'Amara',
    email: 'amara@example.com',
    country: 'Kenya',
    status: 'active',
    joinedAt: '2026-06-11T05:00:00.000Z',
  },
]

export const MOCK_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'ctr_001',
    campaignId: 'cmp_earth',
    sequenceNumber: 1,
    lineOne: 'The glaciers keep a diary in blue,',
    lineTwo: 'and every page we burn, they read aloud.',
    authorId: 'aut_maya',
    authorName: 'Maya R.',
    authorEmail: 'maya@example.com',
    country: 'Canada',
    status: 'approved',
    moderationReason: null,
    createdAt: '2026-06-01T08:12:00.000Z',
  },
  {
    id: 'ctr_002',
    campaignId: 'cmp_earth',
    sequenceNumber: 2,
    lineOne: 'I planted a word where the forest had been,',
    lineTwo: 'it grew into a sentence of leaves again.',
    authorId: 'aut_tomas',
    authorName: 'Tomás',
    authorEmail: 'tomas@example.com',
    country: 'Brazil',
    status: 'approved',
    moderationReason: null,
    createdAt: '2026-06-02T14:40:00.000Z',
  },
  {
    id: 'ctr_003',
    campaignId: 'cmp_earth',
    sequenceNumber: 3,
    lineOne: 'The ocean is not angry, only honest,',
    lineTwo: 'it returns to us exactly what we gave.',
    authorId: 'aut_anon',
    authorName: null,
    authorEmail: 'anon@example.com',
    country: 'Australia',
    status: 'approved',
    moderationReason: null,
    createdAt: '2026-06-03T19:05:00.000Z',
  },
  {
    id: 'ctr_004',
    campaignId: 'cmp_earth',
    sequenceNumber: 4,
    lineOne: 'A child asked the sky why it kept coughing,',
    lineTwo: 'and none of the adults knew where to look.',
    authorId: 'aut_lena',
    authorName: 'Lena K.',
    authorEmail: 'lena@example.com',
    country: 'Germany',
    status: 'approved',
    moderationReason: null,
    createdAt: '2026-06-04T11:22:00.000Z',
  },
  {
    id: 'ctr_005',
    campaignId: 'cmp_earth',
    sequenceNumber: 5,
    lineOne: 'We are the last two lines of an old song,',
    lineTwo: 'so let us make the ending worth the wait.',
    authorId: 'aut_priya',
    authorName: 'Priya',
    authorEmail: 'priya@example.com',
    country: 'India',
    status: 'approved',
    moderationReason: null,
    createdAt: '2026-06-05T07:48:00.000Z',
  },
  {
    id: 'ctr_006',
    campaignId: 'cmp_earth',
    sequenceNumber: 0,
    lineOne: 'Buy our energy drink, smash that subscribe,',
    lineTwo: 'link in bio for the lowest prices online!',
    authorId: 'aut_spam',
    authorName: 'promo_bot',
    authorEmail: 'spam@example.com',
    country: null,
    status: 'rejected',
    moderationReason: 'Off-theme / promotional spam',
    createdAt: '2026-06-05T09:10:00.000Z',
  },
  {
    id: 'ctr_007',
    campaignId: 'cmp_earth',
    sequenceNumber: 0,
    lineOne: 'The rivers remember every name we forgot,',
    lineTwo: 'they whisper them back each time it rains.',
    authorId: 'aut_sven',
    authorName: 'Sven',
    authorEmail: 'sven@example.com',
    country: 'Norway',
    status: 'pending',
    moderationReason: null,
    createdAt: '2026-06-10T16:30:00.000Z',
  },
  {
    id: 'ctr_008',
    campaignId: 'cmp_earth',
    sequenceNumber: 0,
    lineOne: 'Hope is a seed that refuses the drought,',
    lineTwo: 'and roots itself deeper the drier it gets.',
    authorId: 'aut_amara',
    authorName: 'Amara',
    authorEmail: 'amara@example.com',
    country: 'Kenya',
    status: 'pending',
    moderationReason: null,
    createdAt: '2026-06-11T05:55:00.000Z',
  },
]

export const MOCK_MODERATION_SETTINGS: ModerationSettings = {
  id: 'mds_earth',
  campaignId: 'cmp_earth',
  level: 'standard',
  profanityFilter: true,
  enforceTheme: true,
  confidenceThreshold: 0.7,
  updatedAt: '2026-06-09T10:00:00.000Z',
}

export const APPROVED_CONTRIBUTIONS = MOCK_CONTRIBUTIONS.filter(
  (c) => c.status === 'approved',
)

export const APPROVED_COUNT = APPROVED_CONTRIBUTIONS.length

// Each approved couplet contributes 2 lines to the living poem.
export const LINE_COUNT = APPROVED_COUNT * 2

// Distinct authors (anonymous contributions counted once collectively).
export const AUTHOR_COUNT = new Set(
  APPROVED_CONTRIBUTIONS.map((c) => c.authorName?.trim() || 'anonymous'),
).size

// ----------------------------------------------------------------------------
// Campaign helpers (Phase 1 public flow)
// ----------------------------------------------------------------------------

/**
 * Derive a campaign's time-based phase from its start/close dates.
 * In Phase 3 this logic moves to the backend, comparing against the DB clock.
 */
export function getCampaignPhase(
  campaign: Campaign,
  now: Date = new Date(),
): CampaignPhase {
  const start = new Date(campaign.startDate)
  const close = new Date(campaign.closeDate)
  if (now < start) return 'upcoming'
  if (now > close) return 'completed'
  return 'active'
}

export function getCampaignBySlug(slug: string): Campaign | undefined {
  return MOCK_CAMPAIGNS.find((c) => c.slug === slug)
}

export function getApprovedContributions(campaignId: string): Contribution[] {
  return MOCK_CONTRIBUTIONS.filter(
    (c) => c.campaignId === campaignId && c.status === 'approved',
  ).sort((a, b) => a.sequenceNumber - b.sequenceNumber)
}

export interface CampaignStats {
  contributors: number
  couplets: number
  lines: number
}

export function getCampaignStats(campaign: Campaign): CampaignStats {
  const approved = getApprovedContributions(campaign.id)
  // For seeded/historical campaigns, fall back to the stored count.
  const couplets = Math.max(approved.length, campaign.contributionCount)
  const contributors = new Set(
    approved.map((c) => c.authorName?.trim() || c.authorId),
  ).size
  return {
    contributors: Math.max(contributors, couplets > 0 ? 1 : 0),
    couplets,
    lines: couplets * 2,
  }
}

export function formatCampaignDate(iso: string): string {
  // Force UTC so the server (UTC) and client (local TZ) format identically,
  // avoiding React hydration mismatches.
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
