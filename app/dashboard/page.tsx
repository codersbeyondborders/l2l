import Link from "next/link"
import {
  Megaphone,
  Users,
  Clock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react"
import { getDashboardSummary, getContributionsByStatus } from "@/lib/queries"
import { PageHeader } from "@/components/admin/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ContributionStatusBadge } from "@/components/admin/status-badges"

export default async function DashboardOverviewPage() {
  const summary = await getDashboardSummary()
  const pending = await getContributionsByStatus("pending")

  const stats = [
    {
      label: "Active campaigns",
      value: summary.activeCampaigns,
      sub: `${summary.totalCampaigns} total`,
      icon: Megaphone,
    },
    {
      label: "Awaiting review",
      value: summary.pendingCount,
      sub: "needs moderation",
      icon: Clock,
    },
    {
      label: "In the poem",
      value: summary.approvedCount,
      sub: "approved couplets",
      icon: ShieldCheck,
    },
    {
      label: "Authors",
      value: summary.authorCount,
      sub: `${summary.bannedCount} banned`,
      icon: Users,
    },
  ]

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of campaign activity and the moderation queue."
      />

      <section aria-label="Key metrics" className="mb-8">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} size="default">
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <s.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <dt className="truncate text-sm text-muted-foreground">
                    {s.label}
                  </dt>
                  <dd className="font-serif text-2xl font-semibold tabular-nums">
                    {s.value}
                  </dd>
                  <span className="text-xs text-muted-foreground">{s.sub}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </dl>
      </section>

      <section aria-labelledby="queue-heading" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="queue-heading"
            className="font-serif text-xl font-semibold tracking-tight"
          >
            Moderation queue
          </h2>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/dashboard/contributions">
                View all
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
        </div>

        {pending.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              The queue is clear. Every couplet has been reviewed.
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {pending.map((c) => (
              <li key={c.id}>
                <Card size="default">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-col gap-1">
                      <blockquote className="border-l-2 border-primary/40 pl-3 font-serif leading-relaxed text-pretty">
                        <p className="break-words">{c.lineOne}</p>
                        <p className="break-words">{c.lineTwo}</p>
                      </blockquote>
                      <span className="pl-3 text-xs text-muted-foreground">
                        {c.authorName ?? "Anonymous"}
                      </span>
                    </div>
                    <ContributionStatusBadge status={c.status} />
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
