"use client"

import { useState } from "react"
import Link from "next/link"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  AlertCircle,
} from "lucide-react"
import { type Campaign } from "@/lib/mock-data"
import { deleteCampaign } from "@/lib/actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  CampaignStatusBadge,
  AiLevelBadge,
} from "@/components/admin/status-badges"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function CampaignsTable({
  initialCampaigns,
}: {
  initialCampaigns: Campaign[]
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setError(null)
    const previous = campaigns
    // Optimistically remove, then reconcile with the server result.
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
    const result = await deleteCampaign(id)
    if (!result.ok) {
      setCampaigns(previous)
      setError(result.error ?? "Could not delete this campaign.")
    }
  }

  if (campaigns.length === 0) {
    return (
      <Card className="p-10 text-center text-muted-foreground">
        No campaigns yet. Create your first campaign to start a poem.
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>AI Level</TableHead>
              <TableHead className="text-right">Contributions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="max-w-xs">
                  <Link
                    href={`/dashboard/campaigns/${c.id}`}
                    className="font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
                  >
                    {c.title}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.tagline}
                  </p>
                </TableCell>
                <TableCell>
                  <CampaignStatusBadge status={c.status} />
                </TableCell>
                <TableCell>
                  {c.aiModeration ? (
                    <AiLevelBadge level={c.aiLevel} />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Manual
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {c.contributionCount}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(c.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${c.title}`}
                        >
                          <MoreHorizontal
                            className="size-4"
                            aria-hidden="true"
                          />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        render={
                          <Link href={`/dashboard/campaigns/${c.id}`}>
                            <Pencil className="size-4" aria-hidden="true" />
                            Edit
                          </Link>
                        }
                      />
                      <DropdownMenuItem
                        render={
                          <Link href={`/campaign/${c.slug}`} target="_blank">
                            <ExternalLink
                              className="size-4"
                              aria-hidden="true"
                            />
                            View live
                          </Link>
                        }
                      />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
