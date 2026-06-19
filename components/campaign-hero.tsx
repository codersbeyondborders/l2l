"use client"

import Image from "next/image"
import type { Campaign, CampaignPhase } from "@/lib/mock-data"

const PHASE_LABEL: Record<CampaignPhase, string> = {
  active: "Active Now",
  upcoming: "Upcoming",
  completed: "Completed",
}

export function CampaignHero({
  campaign,
  phase,
}: {
  campaign: Campaign
  phase: CampaignPhase
}) {
  return (
    <section
      aria-labelledby="campaign-hero-heading"
      className="relative isolate overflow-hidden"
    >
      <div className="relative min-h-[24rem] w-full sm:min-h-[28rem]">
        <Image
          src={campaign.backgroundImageUrl || "/placeholder.svg"}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text contrast (WCAG) */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex min-h-[24rem] w-full max-w-6xl flex-col justify-end px-6 py-10 sm:min-h-[28rem] sm:py-14">
          <span className="mb-4 inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {PHASE_LABEL[phase]}
          </span>
          <h1
            id="campaign-hero-heading"
            className="max-w-3xl font-serif text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl"
          >
            {campaign.title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/85 text-pretty">
            {campaign.tagline}
          </p>
        </div>
      </div>
    </section>
  )
}
