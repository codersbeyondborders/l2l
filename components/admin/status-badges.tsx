import { Badge } from "@/components/ui/badge"
import type {
  CampaignStatus,
  ContributionStatus,
  ModerationLevel,
  AuthorStatus,
} from "@/lib/mock-data"

type Variant = "default" | "secondary" | "destructive" | "outline"

const CAMPAIGN_META: Record<CampaignStatus, { label: string; variant: Variant }> =
  {
    active: { label: "Active", variant: "default" },
    draft: { label: "Draft", variant: "secondary" },
    paused: { label: "Paused", variant: "outline" },
    completed: { label: "Completed", variant: "secondary" },
    archived: { label: "Archived", variant: "outline" },
  }

const CONTRIBUTION_META: Record<
  ContributionStatus,
  { label: string; variant: Variant }
> = {
  approved: { label: "Approved", variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
  rejected: { label: "Rejected", variant: "destructive" },
}

const AUTHOR_META: Record<AuthorStatus, { label: string; variant: Variant }> = {
  active: { label: "Active", variant: "default" },
  banned: { label: "Banned", variant: "destructive" },
}

const LEVEL_LABEL: Record<ModerationLevel, string> = {
  lenient: "Lenient",
  standard: "Standard",
  strict: "Strict",
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const meta = CAMPAIGN_META[status]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}

export function ContributionStatusBadge({
  status,
}: {
  status: ContributionStatus
}) {
  const meta = CONTRIBUTION_META[status]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}

export function AuthorStatusBadge({ status }: { status: AuthorStatus }) {
  const meta = AUTHOR_META[status]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}

export function AiLevelBadge({ level }: { level: ModerationLevel }) {
  return <Badge variant="outline">{LEVEL_LABEL[level]}</Badge>
}
