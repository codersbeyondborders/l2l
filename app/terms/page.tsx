import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Terms & Conditions · Last2Lines",
  description:
    "Terms and conditions governing the use of Last2Lines, the collective poetry platform.",
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Intro */}
        <section
          aria-labelledby="terms-heading"
          className="border-b border-border/60"
        >
          <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center sm:py-20">
            <p className="mb-3 text-sm font-medium tracking-wide text-primary uppercase">
              Legal
            </p>
            <h1
              id="terms-heading"
              className="font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
            >
              Terms &amp; Conditions
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              Last updated: June 2026
            </p>
          </div>
        </section>

        {/* Body */}
        <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
          <article className="flex flex-col gap-10 text-base leading-relaxed text-muted-foreground">

            <p>
              Welcome to Last2Lines. By accessing, browsing, or submitting
              content to this website, you agree to be bound by the following
              Terms and Conditions. Please read them carefully.
            </p>

            <Section id="purpose" title="1. Purpose and Political Disclaimer">
              <p>
                Last2Lines is a platform dedicated primarily to the art of
                poetry. Content published on this website should not under any
                circumstances be interpreted as reflecting the political
                opinions, beliefs, or affinities of Last2Lines.
              </p>
              <p className="mt-3">
                Any expression, inclination, or commentary regarding political
                schools of thought belongs solely to the individual contributors
                as a work of creative imagination. Such content does not
                represent the stance, opinion, or endorsement of Last2Lines.
              </p>
            </Section>

            <Section id="ownership" title="2. Content Ownership and Licensing">
              <ul className="flex flex-col gap-3 pl-5 list-disc marker:text-muted-foreground/50">
                <li>
                  <span className="font-medium text-foreground">Author Ownership:</span>{" "}
                  The copyright of each individual couplet remains entirely with
                  its respective author.
                </li>
                <li>
                  <span className="font-medium text-foreground">Grant of License:</span>{" "}
                  By submitting content to Last2Lines, authors grant the platform
                  a perpetual, royalty-free, worldwide right to publish, display,
                  distribute, and/or broadcast their couplets across any current
                  or future media channels without prior notice or required
                  approval.
                </li>
                <li>
                  <span className="font-medium text-foreground">Compilation Copyright:</span>{" "}
                  Last2Lines is the legal copyright holder of the overall
                  compilation, design, arrangement, and collective content of
                  this website. No portion of this website&apos;s aggregated content
                  may be reprinted, republished, or redistributed without
                  explicit written consent from Last2Lines.
                </li>
              </ul>
            </Section>

            <Section id="originality" title="3. Submission Guidelines and Originality">
              <p>
                All submissions must be the original work of the submitting
                author. Plagiarism, copying, or extracting someone else&apos;s
                copyrighted work is strictly prohibited. The user assumes sole
                responsibility for ensuring their submission does not violate
                third-party intellectual property rights.
              </p>
            </Section>

            <Section id="moderation" title="4. Moderation System (Human and AI)">
              <p>
                To maintain the quality and safety of our platform, Last2Lines
                utilizes a hybrid moderation process:
              </p>
              <ul className="mt-3 flex flex-col gap-3 pl-5 list-disc marker:text-muted-foreground/50">
                <li>
                  <span className="font-medium text-foreground">AI and Automated Screening:</span>{" "}
                  We employ Artificial Intelligence (AI) and automated software
                  tools to assist in screening submissions. These AI systems
                  analyze text for technical attributes (such as rhyme and
                  structure) and automatically flag potential policy violations,
                  including plagiarism, spam, obscenity, and hate speech.
                </li>
                <li>
                  <span className="font-medium text-foreground">Human Oversight:</span>{" "}
                  Automated tools operate alongside human moderators. Last2Lines
                  retains the absolute right to select, reject, edit, shorten,
                  move, or delete any submission at its sole discretion,
                  whenever necessary to align with platform policies and
                  aesthetic standards.
                </li>
              </ul>
            </Section>

            <Section id="conduct" title="5. Acceptable Use and Hate Speech Policy">
              <p>
                While our moderation systems primarily review submissions for
                poetic structure and rhyme rather than thematic intent, we
                enforce a strict zero-tolerance policy against hate speech.
                Users must not submit content that attacks, dehumanizes, or
                incites hatred against individuals or groups based on:
              </p>
              <ul className="mt-3 flex flex-col gap-2 pl-5 list-disc marker:text-muted-foreground/50">
                <li>Race or ethnicity</li>
                <li>National origin</li>
                <li>Political or religious affiliation</li>
                <li>Sexual orientation, sex, gender, or gender identity</li>
                <li>Serious disabilities or diseases</li>
              </ul>
              <p className="mt-3">
                Despite automated AI screening and manual moderation, harmful
                content may occasionally slip through. We rely on our community
                to report any offensive content to us promptly.
              </p>
            </Section>

            <Section id="disclaimer" title="6. Spontaneity and Disclaimer of Liability">
              <p>
                Content on Last2Lines may be spontaneous, unproofed, unrevised,
                and completely fictional. While our moderation team and AI tools
                make reasonable efforts to keep the platform free of abusive,
                profane, rude, or misleading information, Last2Lines does not
                warrant the accuracy or safety of user-submitted content.
              </p>
              <p className="mt-3">
                Last2Lines assumes no responsibility and hereby disclaims all
                liability to any party for any loss, damage, or disruption
                caused by errors, omissions, or offensive materials, whether
                resulting from negligence, technical accident, or any other
                cause.
              </p>
            </Section>

            <Section id="indemnification" title="7. Indemnification">
              <p>
                You are solely responsible for your submissions. Last2Lines does
                not actively verify whether submissions infringe upon
                third-party copyrights. If a legal claim, demand, or lawsuit is
                brought against Last2Lines due to content you submitted, you
                agree to indemnify, defend, and hold harmless Last2Lines from
                and against all damages, losses, and expenses of any kind
                (including reasonable legal fees and costs) arising from such
                claims.
              </p>
            </Section>

            <Section id="modifications" title="8. Right to Modify or Terminate">
              <p>
                Last2Lines reserves the right, at its sole discretion and
                without prior notice, to alter the focus of the website, modify
                its features, shut down the platform entirely, sell the
                platform, or amend these Terms and Conditions at any time.
                Continued use of the website following changes constitutes your
                acceptance of the revised terms.
              </p>
            </Section>

          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2
        id={id}
        className="font-serif text-xl font-semibold tracking-tight text-foreground"
      >
        {title}
      </h2>
      {children}
    </section>
  )
}
