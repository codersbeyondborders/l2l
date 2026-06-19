import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Admin · Last2Lines",
  description: "Moderation and campaign management for Last2Lines.",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Defense in depth: middleware also guards this, but never render the
  // admin shell without a verified session.
  if (!user) redirect("/auth/login")

  return <AdminShell email={user.email ?? "admin"}>{children}</AdminShell>
}
