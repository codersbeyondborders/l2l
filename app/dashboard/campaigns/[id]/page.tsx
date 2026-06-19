import { notFound } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { CampaignForm } from "@/components/admin/campaign-form"
import { getCampaignById, getSeedCouplets } from "@/lib/queries"

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const campaign = await getCampaignById(id)

  if (!campaign) {
    notFound()
  }

  const seedCouplets = await getSeedCouplets(id)

  return (
    <>
      <PageHeader
        title={campaign.title}
        description="Edit this campaign's details, media, and moderation settings."
      />
      <CampaignForm campaign={campaign} seedCouplets={seedCouplets} />
    </>
  )
}
