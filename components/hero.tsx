import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CountUp } from "@/components/count-up"
import {
  AUTHOR_COUNT,
  LINE_COUNT,
  type Campaign,
} from "@/lib/mock-data"

interface HeroProps {
  campaign: Campaign
}

export function Hero({ campaign }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28"
    >
      <div className="flex flex-col items-center gap-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          {campaign.title}
        </span>

        <h1
          id="hero-heading"
          className="max-w-4xl font-serif text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
        >
          Two lines from you. One poem for the world.
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
          {campaign.description}
        </p>

        {/* Rolling metrics: 1 Voice, X Authors, Y Lines */}
        <dl
          aria-live="polite"
          className="flex flex-wrap items-stretch justify-center gap-4 sm:gap-6"
        >
          <Metric value={1} label="Voice" animate={false} />
          <Divider />
          <Metric value={AUTHOR_COUNT} label={AUTHOR_COUNT === 1 ? "Author" : "Authors"} />
          <Divider />
          <Metric value={LINE_COUNT} label={LINE_COUNT === 1 ? "Line" : "Lines"} />
        </dl>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button
            size="lg"
            nativeButton={false}
            className="h-11 px-6 text-base"
            render={
              <Link href="/#contribute">
                Write Your Two Lines
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            className="h-11 px-6 text-base"
            render={<Link href="/#tapestry">Read the poem</Link>}
          />
        </div>
      </div>
    </section>
  )
}

function Metric({
  value,
  label,
  animate = true,
}: {
  value: number
  label: string
  animate?: boolean
}) {
  return (
    <div className="flex min-w-24 flex-col items-center gap-1 rounded-xl border border-border/70 bg-card px-5 py-4">
      <dd className="font-serif text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
        {animate ? <CountUp end={value} /> : value.toLocaleString()}
      </dd>
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
    </div>
  )
}

function Divider() {
  return (
    <span
      aria-hidden="true"
      className="hidden self-center text-2xl font-light text-border sm:inline"
    >
      /
    </span>
  )
}
