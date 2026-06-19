"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ExternalLink, LogOut, Menu, X } from "lucide-react"
import { AdminSidebarNav } from "./admin-sidebar-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/actions"

function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "admin"
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join(" ")
}

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode
  email: string
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const admin = { name: nameFromEmail(email), email }

  async function handleSignOut() {
    await signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar lg:block">
        <AdminSidebarNav />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-sidebar">
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            </div>
            <AdminSidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>
            <span className="font-medium text-muted-foreground">Admin</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              className="hidden sm:inline-flex"
              render={
                <Link href="/" target="_blank">
                  <ExternalLink className="size-4" aria-hidden="true" />
                  View live app
                </Link>
              }
            />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                    aria-label="Account menu"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                    >
                      {admin.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <span className="hidden max-w-32 truncate font-medium sm:inline">
                      {admin.name}
                    </span>
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {admin.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {admin.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <Link href="/" target="_blank">
                      <ExternalLink
                        className="size-4"
                        aria-hidden="true"
                      />
                      View live app
                    </Link>
                  }
                />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut className="size-4" aria-hidden="true" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
