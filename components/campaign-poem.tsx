"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Contribution } from "@/lib/mock-data"

const PAGE_SIZE = 10

type DisplayCouplet = Contribution & { isSeed?: boolean }

export function CampaignPoem({
  couplets,
}: {
  couplets: DisplayCouplet[]
}) {
  const [visible, setVisible] = useState(PAGE_SIZE)
  const shown = couplets.slice(0, visible)
  const hasMore = visible < couplets.length

  if (couplets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
        <p className="font-serif text-lg font-medium">
          The poem is waiting for its first two lines
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
          No couplets have been approved yet. Be the voice that begins this one.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <article
        aria-label="The collective poem"
        className="rounded-2xl border border-border/70 bg-card px-6 py-10 ring-1 ring-foreground/5 sm:px-12 sm:py-14"
      >
        <ol className="flex flex-col">
          {shown.map((couplet, index) => (
            <Couplet
              key={couplet.id}
              couplet={couplet}
              isLast={index === shown.length - 1}
              isSeed={couplet.isSeed}
            />
          ))}
        </ol>
      </article>

      <div aria-live="polite" className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Showing {shown.length} of {couplets.length} couplets
        </p>
        {hasMore ? (
          <Button
            variant="outline"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          >
            Load more couplets
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function Couplet({
  couplet,
  isLast,
  isSeed,
}: {
  couplet: DisplayCouplet
  isLast: boolean
  isSeed?: boolean
}) {
  const author = couplet.authorName?.trim() || "Anonymous"

  return (
    <li className={isLast ? "pb-0" : "mb-7 border-b border-border/40 pb-7"}>
      <p className="font-serif text-pretty text-xl leading-relaxed text-foreground sm:text-2xl">
        {couplet.lineOne}
        <br />
        {couplet.lineTwo}
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        <span aria-hidden="true">— </span>
        <cite className="not-italic font-medium text-foreground/80">
          {author}
        </cite>
        {isSeed && (
          <span className="ml-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            Seed
          </span>
        )}
        {couplet.country ? (
          <span className="text-muted-foreground">, {couplet.country}</span>
        ) : null}
      </p>
    </li>
  )
}
