"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  Users,
  Settings,
  Feather,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/actions"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/contributions", label: "Contributions", icon: FileText },
  { href: "/dashboard/authors", label: "Authors", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    onNavigate?.()
    await signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <nav aria-label="Admin navigation" className="flex h-full flex-col gap-1 p-3">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="mb-4 flex items-center gap-2 px-3 py-2 font-serif text-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
      >
        <Feather className="size-5 text-primary" aria-hidden="true" />
        Last2Lines
      </Link>

      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <LogOut className="size-4 shrink-0" aria-hidden="true" />
        Log out
      </button>
    </nav>
  )
}
