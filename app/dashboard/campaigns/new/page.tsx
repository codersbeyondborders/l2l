import { PageHeader } from "@/components/admin/page-header"
import { CampaignForm } from "@/components/admin/campaign-form"

export default function NewCampaignPage() {
  return (
    <>
      <PageHeader
        title="New campaign"
        description="Set up a new poetry campaign and how its submissions are moderated."
      />
      <CampaignForm />
    </>
  )
}
