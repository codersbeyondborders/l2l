import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Contact · Last2Lines",
  description:
    "Get in touch with the Last2Lines team via email or GitHub.",
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Intro */}
        <section
          aria-labelledby="contact-heading"
          className="border-b border-border/60"
        >
          <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center sm:py-20">
            <p className="mb-3 text-sm font-medium tracking-wide text-primary uppercase">
              Get in touch
            </p>
            <h1
              id="contact-heading"
              className="font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
            >
              We&apos;d love to hear from you.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Have a question, a campaign idea, or just want to say hello?
              Reach us through either of the channels below.
            </p>
          </div>
        </section>

        {/* Contact cards */}
        <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
          <ul className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            {/* Email */}
            <li className="flex-1">
              <Link
                href="mailto:hello@last2lines.com"
                className="group flex flex-col items-start gap-4 rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p className="mt-0.5 text-sm text-muted-foreground break-all">
                    last2lines@gmail.com
                  </p>
                </div>
              </Link>
            </li>

            {/* GitHub */}
            <li className="flex-1">
              <Link
                href="https://github.com/codersbeyondborders/last2lines-v0-sv"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-start gap-4 rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                
                <div>
                  <p className="font-medium text-foreground">GitHub</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    github.com/codersbeyondborders/last2lines-v0-sv
                  </p>
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
