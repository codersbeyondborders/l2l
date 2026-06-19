"use client"

import { useCallback, useState, useTransition } from "react"
import Link from "next/link"
import {
  Ban,
  ShieldCheck,
  FileText,
  MoreHorizontal,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react"
import { type Author } from "@/lib/mock-data"
import { setAuthorStatus, fetchAuthorsPage } from "@/lib/actions"
import type { GetAuthorsOptions } from "@/lib/queries"
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
import { AuthorStatusBadge } from "@/components/admin/status-badges"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const SUBMISSION_COUNT_FALLBACK = 0

export function AuthorsTable({
  initialAuthors,
  initialNextCursor,
  submissionCounts,
}: {
  initialAuthors: Author[]
  initialNextCursor: string | null
  submissionCounts: Record<string, number>
}) {
  const [authors, setAuthors] = useState<Author[]>(initialAuthors)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [error, setError] = useState<string | null>(null)
  const [loadingMore, startLoadMore] = useTransition()

  const loadMore = useCallback(() => {
    if (!nextCursor) return
    startLoadMore(async () => {
      const opts: GetAuthorsOptions = { cursor: nextCursor }
      const result = await fetchAuthorsPage(opts)
      setAuthors((prev) => [...prev, ...result.items])
      setNextCursor(result.nextCursor)
    })
  }, [nextCursor])

  async function setStatus(id: string, status: Author["status"]) {
    setError(null)
    const previous = authors
    setAuthors((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    )
    const result = await setAuthorStatus({ id, status })
    if (!result.ok) {
      setAuthors(previous)
      setError(result.error ?? "Could not update this author.")
    }
  }

  if (authors.length === 0) {
    return (
      <Card className="p-10 text-center text-muted-foreground">
        No authors have contributed yet.
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
              <TableHead>Author</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Submissions</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody aria-live="polite">
            {authors.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">
                  {a.name ?? "Anonymous"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="break-all">{a.email}</span>
                </TableCell>
                <TableCell>
                  <AuthorStatusBadge status={a.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {submissionCounts[a.id] ?? SUBMISSION_COUNT_FALLBACK}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(a.joinedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${a.name ?? "anonymous"}`}
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
                          <Link
                            href={`/dashboard/contributions?author=${a.id}`}
                          >
                            <FileText className="size-4" aria-hidden="true" />
                            View submissions
                          </Link>
                        }
                      />
                      <DropdownMenuSeparator />
                      {a.status === "banned" ? (
                        <DropdownMenuItem
                          onClick={() => setStatus(a.id, "active")}
                        >
                          <ShieldCheck
                            className="size-4"
                            aria-hidden="true"
                          />
                          Reinstate author
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setStatus(a.id, "banned")}
                        >
                          <Ban className="size-4" aria-hidden="true" />
                          Ban author
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

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
                Loading&hellip;
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
    </div>
  )
}
