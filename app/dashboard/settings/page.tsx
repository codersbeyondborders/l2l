import { PageHeader } from "@/components/admin/page-header"
import { SettingsForm } from "@/components/admin/settings-form"

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Organization details and the default AI moderation behavior for new campaigns."
      />
      <SettingsForm />
    </>
  )
}
