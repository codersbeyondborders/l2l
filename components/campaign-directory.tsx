"use client"

import { useMemo, useState, useId } from "react"
import { Search, X } from "lucide-react"
import {
  getCampaignPhase,
  type Campaign,
  type CampaignPhase,
} from "@/lib/mock-data"
import { CampaignCard } from "@/components/campaign-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FilterValue = "all" | CampaignPhase

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active Now" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
]

export function CampaignDirectory({ campaigns }: { campaigns: Campaign[] }) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterValue>("all")
  const searchId = useId()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return campaigns.filter((campaign) => {
      const phase = getCampaignPhase(campaign)
      const matchesFilter = filter === "all" || phase === filter
      const matchesQuery =
        q.length === 0 ||
        campaign.title.toLowerCase().includes(q) ||
        campaign.description.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  }, [query, filter, campaigns])

  return (
    <section aria-labelledby="directory-heading" className="flex flex-col gap-8">
      <h2 id="directory-heading" className="sr-only">
        Browse campaigns
      </h2>

      {/* Title + subtitle */}
      <div className="flex flex-col gap-1.5 mx-auto text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          Campaigns
        </p>
        <h2 className="font-serif text-4xl font-semibold tracking-tight text-balance leading-tight sm:text-5xl">
          Causes worth two lines.
        </h2>
        <p className="mt-1 max-w-xl text-base leading-relaxed text-muted-foreground">
          Every campaign is a living poem, built one couplet at a time. Find a
          cause that moves you and add your voice.
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Label htmlFor={searchId} className="sr-only">
            Search campaigns by title or description
          </Label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="h-11 pl-9 pr-9"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div
          role="group"
          aria-label="Filter campaigns by status"
          className="flex flex-wrap gap-2"
        >
          {FILTERS.map((f) => {
            const active = filter === f.value
            return (
              <Button
                key={f.value}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                aria-pressed={active}
                onClick={() => setFilter(f.value)}
                className={cn("rounded-full", !active && "text-muted-foreground")}
              >
                {f.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Results */}
      <div aria-live="polite">
        <p className="sr-only">
          {results.length}{" "}
          {results.length === 1 ? "campaign" : "campaigns"} found
        </p>
        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
            <p className="font-serif text-lg font-medium">No campaigns found</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
              Try a different search term or clear the filters to see every
              campaign.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((campaign) => (
              <li key={campaign.id} className="flex">
                <CampaignCard campaign={campaign} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
