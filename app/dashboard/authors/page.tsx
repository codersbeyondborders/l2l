import { PageHeader } from "@/components/admin/page-header"
import { AuthorsTable } from "@/components/admin/authors-table"
import { getAuthors, getSubmissionCounts } from "@/lib/queries"

export default async function AuthorsPage() {
  const [{ items, nextCursor }, submissionCounts] = await Promise.all([
    getAuthors(),
    getSubmissionCounts(),
  ])

  return (
    <>
      <PageHeader
        title="Authors"
        description="Manage contributors, review their submissions, and ban or reinstate accounts."
      />
      <AuthorsTable
        initialAuthors={items}
        initialNextCursor={nextCursor}
        submissionCounts={submissionCounts}
      />
    </>
  )
}
