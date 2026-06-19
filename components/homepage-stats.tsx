"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { CampaignStatRow } from "@/lib/queries"

interface HomepageStatsProps {
  totalCampaigns: number
  totalAuthors: number
  totalLines: number
  campaigns: CampaignStatRow[]
}

// ---------------------------------------------------------------------------
// CountUp — only animates once the parent section is visible in the viewport
// ---------------------------------------------------------------------------

function useCountUp(end: number, visible: boolean, duration = 1100) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!visible) return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) { setValue(end); return }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setValue(0)
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * end))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [end, visible, duration])

  return value
}

// ---------------------------------------------------------------------------
// Single stat tile
// ---------------------------------------------------------------------------

function Stat({
  value,
  label,
  delay,
  visible,
}: {
  value: number
  label: string
  delay: number
  visible: boolean
}) {
  const count = useCountUp(value, visible)

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 px-4 py-8",
        "transition-[opacity,transform] duration-500 ease-out",
      )}
      style={{
        opacity:           visible ? 1 : 0,
        transform:         visible ? "translateY(0)" : "translateY(12px)",
        transitionDelay:   `${delay}ms`,
      }}
    >
      <span className="font-serif text-5xl font-semibold tabular-nums text-foreground sm:text-6xl">
        {count.toLocaleString()}
      </span>
      <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const ALL = "__all__"

export function HomepageStats({
  totalCampaigns,
  totalAuthors,
  totalLines,
  campaigns,
}: HomepageStatsProps) {
  const [selected, setSelected] = useState(ALL)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [])

  const campaign = campaigns.find((c) => c.id === selected) ?? null

  const campaigns_val = campaign ? 1           : totalCampaigns
  const authors_val   = campaign ? campaign.authors : totalAuthors
  const lines_val     = campaign ? campaign.lines   : totalLines

  return (
    <section
      ref={sectionRef}
      aria-label="Platform statistics"
      className="border-y border-border/60 bg-muted/40 dark:bg-muted/15"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-14">

        {/* Header row */}
        <div
          className="mb-2 flex items-center justify-between gap-4"
          style={{
            opacity:    visible ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            By the numbers
          </p>

          {/* Dropdown */}
          <div className="relative">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              aria-label="Filter stats by campaign"
              className={cn(
                "appearance-none cursor-pointer rounded-lg border border-border/70 bg-background",
                "pl-3 pr-8 py-1.5 text-xs font-medium text-foreground",
                "transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring",
              )}
            >
              <option value={ALL}>All Campaigns</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            {/* Custom chevron */}
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground"
              viewBox="0 0 12 12" fill="none" aria-hidden="true"
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-border/60">
          <Stat value={campaigns_val} label={campaigns_val === 1 ? "Campaign" : "Campaigns"} delay={0}   visible={visible} />
          <Stat value={authors_val}   label={authors_val   === 1 ? "Author"   : "Authors"}   delay={80}  visible={visible} />
          <Stat value={lines_val}     label={lines_val     === 1 ? "Line"     : "Lines Written"} delay={160} visible={visible} />
        </div>

      </div>
    </section>
  )
}
