import { PageHeader } from "@/components/admin/page-header"
import { ContributionsTable } from "@/components/admin/contributions-table"
import {
  getAllContributions,
  getContributionStatusCounts,
  getCampaigns,
} from "@/lib/queries"
import type { ContributionStatus } from "@/lib/mock-data"

const VALID_STATUSES = new Set<string>(["pending", "approved", "rejected"])

export default async function ContributionsPage({
  searchParams,
}: {
  searchParams: Promise<{ author?: string; status?: string; cursor?: string }>
}) {
  const { author, status: rawStatus, cursor } = await searchParams

  const status =
    rawStatus && VALID_STATUSES.has(rawStatus)
      ? (rawStatus as ContributionStatus)
      : undefined

  const [{ items, nextCursor }, statusCounts, campaigns] = await Promise.all([
    getAllContributions({
      status: status ?? "all",
      authorId: author,
      cursor: cursor ?? null,
    }),
    getContributionStatusCounts({ authorId: author }),
    getCampaigns(),
  ])

  const campaignTitles = Object.fromEntries(
    campaigns.map((c) => [c.id, c.title]),
  )

  return (
    <>
      <PageHeader
        title="Contributions"
        description="Review every submitted couplet, override AI decisions, edit lines, or remove entries."
      />
      <ContributionsTable
        initialContributions={items}
        initialNextCursor={nextCursor}
        statusCounts={statusCounts}
        campaignTitles={campaignTitles}
        authorId={author}
        currentStatus={status ?? "all"}
      />
    </>
  )
}
