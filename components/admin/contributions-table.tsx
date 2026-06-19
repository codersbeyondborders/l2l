"use client"

import { useCallback, useState, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Check,
  X,
  Trash2,
  Pencil,
  Loader2,
  MoreHorizontal,
  AlertCircle,
  ChevronDown,
} from "lucide-react"
import {
  type Contribution,
  type ContributionStatus,
} from "@/lib/mock-data"
import {
  moderateContribution,
  editContribution,
  deleteContribution,
  fetchContributionsPage,
} from "@/lib/actions"
import type { ContributionStatusCounts, GetContributionsOptions } from "@/lib/queries"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ContributionStatusBadge } from "@/components/admin/status-badges"
import { cn } from "@/lib/utils"

type FilterKey = ContributionStatus | "all"

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
]

const CAMPAIGN_TITLE_FALLBACK = "—"

interface ContributionsTableProps {
  initialContributions: Contribution[]
  /** Opaque cursor for the next page, or null when all rows are loaded. */
  initialNextCursor: string | null
  /** Accurate per-status counts from the server (not computed from loaded items). */
  statusCounts: ContributionStatusCounts
  campaignTitles: Record<string, string>
  /** When set the table is scoped to one author (passed through to load-more). */
  authorId?: string
  /** Active status filter applied server-side (from URL param). */
  currentStatus?: FilterKey
}

export function ContributionsTable({
  initialContributions,
  initialNextCursor,
  statusCounts,
  campaignTitles,
  authorId,
  currentStatus = "all",
}: ContributionsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [items, setItems] = useState<Contribution[]>(initialContributions)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [actingId, setActingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingMore, startLoadMore] = useTransition()

  // Inline edit state.
  const [editing, setEditing] = useState<Contribution | null>(null)
  const [editLineOne, setEditLineOne] = useState("")
  const [editLineTwo, setEditLineTwo] = useState("")

  // -------------------------------------------------------------------------
  // Filter tab navigation — changes URL, which triggers a full server re-fetch
  // so counts and items are always accurate.
  // -------------------------------------------------------------------------
  function navigateFilter(key: FilterKey) {
    const params = new URLSearchParams(searchParams.toString())
    // Remove cursor when changing filters — start at the first page.
    params.delete("cursor")
    if (key === "all") {
      params.delete("status")
    } else {
      params.set("status", key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  // -------------------------------------------------------------------------
  // Load more — appends the next page of items without a full navigation.
  // -------------------------------------------------------------------------
  const loadMore = useCallback(() => {
    if (!nextCursor) return
    startLoadMore(async () => {
      const opts: GetContributionsOptions = {
        cursor: nextCursor,
        ...(currentStatus !== "all" && { status: currentStatus }),
        ...(authorId && { authorId }),
      }
      const result = await fetchContributionsPage(opts)
      setItems((prev) => [...prev, ...result.items])
      setNextCursor(result.nextCursor)
    })
  }, [nextCursor, currentStatus, authorId])

  // -------------------------------------------------------------------------
  // Moderation + delete — optimistic updates.
  // -------------------------------------------------------------------------
  async function moderate(
    id: string,
    status: ContributionStatus,
    reason: string | null,
  ) {
    setError(null)
    setActingId(id)
    const previous = items
    setItems((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status, moderationReason: reason } : c,
      ),
    )
    const result = await moderateContribution({ id, status, reason })
    setActingId(null)
    if (!result.ok) {
      setItems(previous)
      setError(result.error ?? "Could not update this contribution.")
    }
  }

  async function remove(id: string) {
    setError(null)
    const previous = items
    setItems((prev) => prev.filter((c) => c.id !== id))
    const result = await deleteContribution(id)
    if (!result.ok) {
      setItems(previous)
      setError(result.error ?? "Could not delete this contribution.")
    }
  }

  function openEdit(c: Contribution) {
    setEditing(c)
    setEditLineOne(c.lineOne)
    setEditLineTwo(c.lineTwo)
  }

  async function saveEdit() {
    if (!editing) return
    const id = editing.id
    const lineOne = editLineOne.trim()
    const lineTwo = editLineTwo.trim()
    const previous = items
    setItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, lineOne, lineTwo } : c)),
    )
    setEditing(null)
    const result = await editContribution({ id, lineOne, lineTwo })
    if (!result.ok) {
      setItems(previous)
      setError(result.error ?? "Could not save your edits.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter tabs */}
      <div
        role="tablist"
        aria-label="Filter contributions by status"
        className="flex flex-wrap items-center gap-2"
      >
        {FILTERS.map((f) => {
          const active = currentStatus === f.key
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => navigateFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {statusCounts[f.key]}
              </span>
            </button>
          )
        })}
      </div>

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

      {items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No contributions match this view.
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-right">#</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="min-w-64">Couplet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-40">AI Feedback</TableHead>
                <TableHead className="w-12 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody aria-live="polite">
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {c.sequenceNumber || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {campaignTitles[c.campaignId] ?? CAMPAIGN_TITLE_FALLBACK}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {c.authorName ?? "Anonymous"}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <div className="flex flex-col font-serif leading-snug whitespace-normal">
                      <span className="break-words">{c.lineOne}</span>
                      <span className="break-words">{c.lineTwo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ContributionStatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <span className="block max-w-48 whitespace-normal text-pretty">
                      {c.moderationReason ??
                        (c.status === "approved"
                          ? "Auto-approved"
                          : c.status === "pending"
                            ? "Awaiting review"
                            : "—")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={actingId === c.id}
                            aria-label={`Actions for couplet by ${c.authorName ?? "anonymous"}`}
                          >
                            {actingId === c.id ? (
                              <Loader2
                                className="size-4 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <MoreHorizontal
                                className="size-4"
                                aria-hidden="true"
                              />
                            )}
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        {c.status !== "approved" ? (
                          <DropdownMenuItem
                            onClick={() => moderate(c.id, "approved", null)}
                          >
                            <Check className="size-4" aria-hidden="true" />
                            Approve
                          </DropdownMenuItem>
                        ) : null}
                        {c.status !== "rejected" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              moderate(
                                c.id,
                                "rejected",
                                "Rejected by moderator",
                              )
                            }
                          >
                            <X className="size-4" aria-hidden="true" />
                            Reject
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem onClick={() => openEdit(c)}>
                          <Pencil className="size-4" aria-hidden="true" />
                          Edit lines
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => remove(c.id)}
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
      )}

      {/* Load more */}
      {nextCursor ? (
        <div className="flex items-center justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            disabled={loadingMore}
            aria-live="polite"
          >
            {loadingMore ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Loading…
              </>
            ) : (
              <>
                <ChevronDown className="size-4" aria-hidden="true" />
                Load more
              </>
            )}
          </Button>
        </div>
      ) : null}

      {/* Inline edit panel */}
      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-title"
        >
          <Card className="w-full max-w-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveEdit()
              }}
              className="flex flex-col gap-4 p-6"
            >
              <h2
                id="edit-title"
                className="font-serif text-lg font-semibold tracking-tight"
              >
                Edit couplet
              </h2>
              <p className="text-sm text-muted-foreground">
                Fix a typo without rejecting the submission. The author and
                status are unchanged.
              </p>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-line-1">First line</Label>
                <Input
                  id="edit-line-1"
                  value={editLineOne}
                  maxLength={100}
                  onChange={(e) => setEditLineOne(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-line-2">Second line</Label>
                <Input
                  id="edit-line-2"
                  value={editLineTwo}
                  maxLength={100}
                  onChange={(e) => setEditLineTwo(e.target.value)}
                />
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!editLineOne.trim() || !editLineTwo.trim()}
                >
                  Save
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
