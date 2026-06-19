"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import type { Campaign } from "@/lib/mock-data"

interface CampaignFilterClientProps {
  campaigns: Campaign[]
  selectedCampaignId?: string
}

export function CampaignFilterClient({
  campaigns,
  selectedCampaignId,
}: CampaignFilterClientProps) {
  const router = useRouter()

  const handleCampaignChange = useCallback(
    (campaignId: string) => {
      if (campaignId === "all") {
        router.push("/visualize")
      } else {
        router.push(`/visualize?campaign=${campaignId}`)
      }
    },
    [router],
  )

  const selectedCampaign = selectedCampaignId
    ? campaigns.find((c) => c.id === selectedCampaignId)
    : null

  const displayName = selectedCampaign?.title ?? "All Campaigns"

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-foreground">Filter by Campaign</label>
      <div className="relative inline-block max-w-xs w-full">
        <div className="relative">
          <select
            value={selectedCampaignId ?? "all"}
            onChange={(e) => handleCampaignChange(e.target.value)}
            className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-border/50 text-foreground text-sm font-medium transition-all duration-200 hover:border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
      {selectedCampaign && (
        <p className="text-xs text-muted-foreground">
          Showing {selectedCampaign.contributionCount} contribution{selectedCampaign.contributionCount !== 1 ? "s" : ""} from "{selectedCampaign.title}"
        </p>
      )}
    </div>
  )
}
