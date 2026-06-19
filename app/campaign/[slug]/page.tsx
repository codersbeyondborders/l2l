import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Heart, PlayCircle } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CampaignHero } from "@/components/campaign-hero"
import { CampaignSubmission } from "@/components/campaign-submission"
import { CampaignPoem } from "@/components/campaign-poem"
import { Button } from "@/components/ui/button"
import { getCampaignPhase, formatCampaignDate } from "@/lib/mock-data"
import {
  getCampaignBySlug,
  getApprovedContributions,
  getSeedCouplets,
} from "@/lib/queries"

// Campaign content is live and DB-backed, so render on demand rather than
// prerendering (the database is not reachable at build time).
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const campaign = await getCampaignBySlug(slug)
  if (!campaign) return { title: "Campaign not found — Last2Lines" }
  return {
    title: `${campaign.title} — Last2Lines`,
    description: campaign.tagline,
  }
}

// Streamed async component so the hero + form render before the poem arrives.
async function PoemSection({ campaignId }: { campaignId: string }) {
  const [contributions, seedCouplets] = await Promise.all([
    getApprovedContributions(campaignId),
    getSeedCouplets(campaignId),
  ])
  
  // Combine seed couplets and contributions, seeds first.
  // Seed couplets must satisfy the full Contribution shape required by CampaignPoem.
  const combinedCouplets = [
    ...seedCouplets.map((seed, i) => ({
      id: seed.id,
      campaignId,
      sequenceNumber: i + 1,
      lineOne: seed.lineOne,
      lineTwo: seed.lineTwo,
      authorId: "seed",
      authorName: seed.author,
      authorEmail: "",
      country: null,
      status: "approved" as const,
      moderationReason: null,
      createdAt: new Date(0).toISOString(),
      isSeed: true,
    })),
    ...contributions.map((c) => ({ ...c, isSeed: false })),
  ]
  
  return <CampaignPoem couplets={combinedCouplets} />
}

function PoemSkeleton() {
  return (
    <div className="space-y-6 py-4" aria-busy="true" aria-label="Loading poem">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mx-auto h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const campaign = await getCampaignBySlug(slug)
  if (!campaign) notFound()

  const phase = getCampaignPhase(campaign)
  // Fetch couplets in parallel with any other data that may be added later.
  const [contributions, seedCouplets] = await Promise.all([
    getApprovedContributions(campaign.id),
    getSeedCouplets(campaign.id),
  ])
  const allCouplets = [...seedCouplets, ...contributions]
  const contributors = new Set(
    contributions.map((c) => c.authorName?.trim() || c.authorId),
  ).size
  const stats = {
    contributors: Math.max(contributors, contributions.length > 0 ? 1 : 0),
    couplets: allCouplets.length,
    lines: allCouplets.length * 2,
  }

  const statItems = [
    { label: "Voice", value: "1" },
    { label: "Authors", value: stats.contributors.toLocaleString() },
    { label: "Lines", value: stats.lines.toLocaleString() },
  ]

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <CampaignHero campaign={campaign} phase={phase} />

        {/* Back link + stats */}
        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              All campaigns
            </Link>
            <dl className="mt-6 grid grid-cols-3 gap-4">
              {statItems.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-card px-4 py-5 text-center"
                >
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold tabular-nums sm:text-3xl">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* About + instructions */}
        <section
          aria-labelledby="about-heading"
          className="border-b border-border"
        >
          <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
            <article>
              <h3
                id="about-heading"
                className="font-serif text-lg font-semibold"
              >
                About this campaign
              </h3>

              

              <p className="mt-4 text-xs text-muted-foreground">
                {phase === "upcoming"
                  ? `Opens ${formatCampaignDate(campaign.startDate)}`
                  : phase === "completed"
                    ? `Closed ${formatCampaignDate(campaign.closeDate)}`
                    : `Open until ${formatCampaignDate(campaign.closeDate)}`}
              </p>

              <p className="mt-4 leading-relaxed text-muted-foreground text-pretty">
                {campaign.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {campaign.videoLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={
                      <a
                        href={campaign.videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <PlayCircle className="size-4" aria-hidden="true" />
                        Watch the film
                      </a>
                    }
                  />
                )}
                {campaign.donationLink && (
                  <Button
                    size="sm"
                    nativeButton={false}
                    render={
                      <a
                        href={campaign.donationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Heart className="size-4" aria-hidden="true" />
                        Support the cause
                      </a>
                    }
                  />
                )}
              </div>
              
            </article>

            <aside aria-labelledby="how-heading">
              <h3
                id="how-heading"
                className="font-serif text-lg font-semibold"
              >
                How to contribute
              </h3>
              <ol className="mt-4 space-y-3">
                {campaign.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground text-pretty">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<a href="#poem">Read the poem</a>}
                />
                <Button
                  size="sm"
                  nativeButton={false}
                  render={<a href="#contribute">Write your two lines</a>}
                />
              </div>

              
            </aside>
          </div>
        </section>

        {/* Living poem */}
        <section
          id="poem"
          aria-labelledby="poem-heading"
          className="scroll-mt-20 border-b border-border"
        >
          <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="mb-8 text-center">
              <h2
                id="poem-heading"
                className="font-serif text-2xl font-semibold text-balance sm:text-3xl"
              >
                {campaign.title}
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
                {stats.couplets.toLocaleString()} couplets, stitched into one
                continuous voice.
              </p>
            </div>
            <Suspense fallback={<PoemSkeleton />}>
              <PoemSection campaignId={campaign.id} />
            </Suspense>
          </div>
        </section>

        {/* Contribution form */}
        <section
          id="contribute"
          aria-labelledby="contribute-heading"
          className="scroll-mt-20 border-b border-border bg-muted/30"
        >
          <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="mb-8 text-center">
              <h2
                id="contribute-heading"
                className="font-serif text-2xl font-semibold text-balance sm:text-3xl"
              >
                Add your two lines
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
                Your couplet becomes a permanent verse in this living poem.
              </p>
            </div>
            <CampaignSubmission campaign={campaign} phase={phase} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
