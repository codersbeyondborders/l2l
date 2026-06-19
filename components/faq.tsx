"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    q: "What is Last2Lines?",
    a: "Last2Lines is a collective poetry platform where anyone can contribute exactly two lines of free verse to a shared, living poem built around a cause. Every approved couplet is stitched together into one continuous tapestry of human voices.",
  },
  {
    q: "Do I need an account to contribute?",
    a: "No account is required. You simply provide your name (optional) and an email address when you submit your two lines. Your email is only used to tie contributions to a single author and is never shared or sold.",
  },
  {
    q: "How does moderation work?",
    a: "Every submission passes through a hybrid moderation process — an AI model screens for policy violations (spam, hate speech, off-theme content), and human moderators make final calls. We aim to be fair and fast; most couplets are reviewed within 24 hours.",
  },
  {
    q: "Can I submit to multiple campaigns?",
    a: "Yes. Each campaign is independent. You can contribute two lines to as many active campaigns as you like — each couplet joins that campaign's specific poem.",
  },
  {
    q: "Who owns the lines I write?",
    a: "You do. Copyright of your individual couplet stays with you. By submitting you grant Last2Lines a perpetual, royalty-free licence to publish and display your lines as part of the collective poem, across any media channel.",
  },
  {
    q: "What makes a good couplet?",
    a: "Authenticity beats polish. Keep each line under 100 characters, stay close to the campaign theme, and say what you actually feel. You don't need to be a poet — the constraint of two lines is the whole point.",
  },
  {
    q: "Can I see the full poem?",
    a: "Yes. Every campaign page shows the full, continuously growing poem made from all approved couplets, in the order they were accepted.",
  },
]

interface FaqItemProps {
  q: string
  a: string
}

function FaqItem({ q, a }: FaqItemProps) {
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
      >
        <span>{q}</span>
        {/* Animated chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={cn(
            "shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180",
          )}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Animated height reveal */}
      <div
        ref={contentRef}
        style={{
          maxHeight: open ? contentRef.current?.scrollHeight : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <p className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {a}
        </p>
      </div>
    </div>
  )
}

export function Faq() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="border-t border-border/60 bg-background"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
          {/* Left — heading */}
          <div className="lg:pt-2">
            <h2
              id="faq-heading"
              className="font-serif text-4xl font-semibold tracking-tight text-balance leading-tight sm:text-5xl"
            >
              Frequently
              <br />
              Asked
              <br />
              Questions
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-pretty">
              Still have questions?{" "}
              <a
                href="/contact"
                className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
              >
                Get in touch
              </a>
              .
            </p>
          </div>

          {/* Right — accordion */}
          <div className="divide-y-0 border-t border-border/60">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
