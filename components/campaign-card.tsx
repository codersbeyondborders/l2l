import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, CalendarDays } from "lucide-react"
import {
  formatCampaignDate,
  getCampaignPhase,
  getCampaignStats,
  type Campaign,
  type CampaignPhase,
} from "@/lib/mock-data"

const PHASE_BADGE: Record<CampaignPhase, { label: string; className: string }> =
  {
    active: {
      label: "Active Now",
      className: "bg-primary text-primary-foreground",
    },
    upcoming: {
      label: "Upcoming",
      className: "bg-secondary text-secondary-foreground border border-border",
    },
    completed: {
      label: "Completed",
      className: "bg-muted text-muted-foreground border border-border",
    },
  }

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const phase = getCampaignPhase(campaign)
  const stats = getCampaignStats(campaign)
  const badge = PHASE_BADGE[phase]

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-colors hover:border-border focus-within:border-primary">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={campaign.backgroundImageUrl || "/placeholder.svg"}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-serif text-xl font-semibold tracking-tight text-balance">
            <Link
              href={`/campaign/${campaign.slug}`}
              className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline"
            >
              {campaign.title}
            </Link>
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            {campaign.tagline}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            <span>
              {formatCampaignDate(campaign.startDate)} —{" "}
              {formatCampaignDate(campaign.closeDate)}
            </span>
          </p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {stats.lines.toLocaleString()}{" "}
              <span className="text-muted-foreground">
                {stats.lines === 1 ? "Line" : "Lines"} Written
              </span>
            </p>
            <span
              aria-hidden="true"
              className="flex items-center gap-1 text-sm font-medium text-primary"
            >
              View
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
