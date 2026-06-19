import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="font-sans text-lg font-semibold tracking-tight">
            Last || Lines
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 text-sm font-medium text-muted-foreground sm:flex"
        >
          <Link
            href="/"
            className="rounded-md px-3 py-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="rounded-md px-3 py-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            About
          </Link>
          <Link
            href="/visualize"
            className="rounded-md px-3 py-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Map
          </Link>
          <Link
            href="/contact"
            className="rounded-md px-3 py-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            size="sm"
            nativeButton={false}
            className="hidden sm:inline-flex"
            render={<Link href="/#campaigns">Campaigns</Link>}
          />
        </div>
      </div>
    </header>
  )
}
