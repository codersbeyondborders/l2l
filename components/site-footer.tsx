import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground text-pretty">
            copyright &copy; 2026 Last2Lines.com  | All Rights Reserved.
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          <Link
            href="/"
            className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            About
          </Link>
          <Link
            href="/#campaigns"
            className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Campaigns
          </Link>
          <Link
            href="/visualize"
            className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Map
          </Link>
          <Link
            href="/terms"
            className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Terms
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Admin
          </Link>
          <Link
            href="/contact"
            className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}
