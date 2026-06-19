// Type-only exports for use in client components
// These types are shared between server actions and client components

export interface SeedCoupletInput {
  lineOne: string
  lineTwo: string
  author: string
}

export interface CampaignInput {
  title: string
  tagline: string
  description: string
  backgroundImageUrl?: string | null
  status: "draft" | "active" | "paused" | "completed"
  aiModeration: boolean
  aiLevel: "lenient" | "standard" | "strict"
  videoLink?: string | null
  donationLink?: string | null
  requireEmailVerification: boolean
  autoEmailOnPublish: boolean
  startDate: string
  closeDate: string
  seedCouplets?: SeedCoupletInput[]
}

export interface SubmitResult {
  ok: boolean
  error?: string
  status?: string
}

export interface CampaignResult extends SubmitResult {
  id?: string
}
