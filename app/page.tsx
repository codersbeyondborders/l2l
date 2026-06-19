import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CampaignDirectory } from "@/components/campaign-directory"
import { HomepageStats } from "@/components/homepage-stats"
import { Faq } from "@/components/faq"
import { Button } from "@/components/ui/button"
import { getCampaigns, getHomepageStats } from "@/lib/queries"

// Stats and campaigns are DB-backed — render on demand.
export const dynamic = "force-dynamic"

// Separated async component so the hero renders immediately via streaming
// while campaigns load in the background.
async function CampaignsSection() {
  const campaigns = await getCampaigns()
  return (
    <div id="campaigns" className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16 scroll-mt-20">
      <CampaignDirectory campaigns={campaigns} />
    </div>
  )
}

async function StatsSection() {
  const stats = await getHomepageStats()
  return (
    <HomepageStats
      totalCampaigns={stats.totalCampaigns}
      totalAuthors={stats.totalAuthors}
      totalLines={stats.totalLines}
      campaigns={stats.campaigns}
    />
  )
}

// Skeleton shown while campaigns load
function CampaignsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
      <div className="mb-8 flex flex-col gap-4">
        <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
      </div>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <li key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
        ))}
      </ul>
    </div>
  )
}

// Skeleton for stats while they stream in
function StatsSkeleton() {
  return (
    <div className="border-y border-border/60 bg-muted/50 dark:bg-muted/20">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-px sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 py-6 sm:py-0">
              <div className="h-14 w-24 animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero — renders immediately, no data dependency */}
        <section
          aria-labelledby="home-heading"
          className="bg-muted/40 dark:bg-muted/15"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-16 text-center sm:py-24">
            <p className="mb-3 text-sm font-medium tracking-wide text-primary uppercase">
              The collective poetry project
            </p>
            <h1
              id="home-heading"
              className="mx-auto max-w-3xl font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
            >
              Two lines from you. One poem for every cause.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Discover campaigns for the causes that matter, then add your two
              lines to a living poem written by the whole world.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                className="h-11 px-6 text-base"
                render={
                  <a href="#campaigns">
                    Explore Campaigns
                   
                  </a>
                }
              />

               <Button
                size="lg"
                nativeButton={false}
                className="h-11 px-6 text-base"
                render={
                  <Link href="/campaign/two-lines-for-the-earth#contribute">
                    Write Your Lines
                  </Link>
                }
              />

              <Button
                size="lg"
                variant="ghost"
                nativeButton={false}
                className="h-11 px-6 text-base"
                render={
                  <Link href="/about">
                    More
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                }
              />
             
              
            </div>
          </div>
        </section>

        {/* Stats — streamed independently */}
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection />
        </Suspense>

        {/* Campaign directory — streamed independently */}
        <Suspense fallback={<CampaignsSkeleton />}>
          <CampaignsSection />
        </Suspense>

        {/* FAQ */}
        <Faq />
      </main>

      <SiteFooter />
    </div>
  )
}
