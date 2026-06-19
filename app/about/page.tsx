import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "About · Last2Lines",
  description:
    "Last2Lines is an award-winning digital campaigning platform that empowers people to voice their sentiments peacefully through two lines of poetry.",
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Intro */}
        <section
          aria-labelledby="about-heading"
          className="border-b border-border/60"
        >
          <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center sm:py-20">
            <p className="mb-3 text-sm font-medium tracking-wide text-primary uppercase">
              About Last2Lines
            </p>
            <h1
              id="about-heading"
              className="font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
            >
              A peaceful sanctuary for collective human sentiment.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
              In a digital landscape often dominated by algorithmic noise and
              polarized shouting, Last2Lines offers a peaceful, minimalist
              sanctuary for collective human sentiment. We believe that
              meaningful advocacy doesn&apos;t have to shout to be heard—it just
              needs to resonate.
            </p>
          </div>
        </section>

        {/* Body */}
        <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
          <article className="flex flex-col gap-12">
            <section className="flex flex-col gap-4">
              <p className="text-base leading-relaxed text-foreground text-pretty">
                Last2Lines is an award-winning digital campaigning platform that
                empowers people across the globe to voice their sentiments
                peacefully through poetry. By inviting individuals to contribute
                just two lines of free-verse poetry to a shared cause, we
                transform isolated micro-expressions into a massive,
                interconnected, living tapestry of human solidarity.
              </p>
            </section>

            <section
              aria-labelledby="mission-heading"
              className="flex flex-col gap-3"
            >
              <h2
                id="mission-heading"
                className="font-serif text-2xl font-semibold tracking-tight"
              >
                The Core Mission
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground text-pretty">
                To democratize social advocacy by lowering the barrier to
                expression, utilizing creative technology to fuse individual
                poetic voices into a singular, continuous, global chorus for
                social good.
              </p>
            </section>

            <section
              aria-labelledby="why-heading"
              className="flex flex-col gap-4"
            >
              <h2
                id="why-heading"
                className="font-serif text-2xl font-semibold tracking-tight"
              >
                Why Two Lines?
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground text-pretty">
                Traditional advocacy campaigns often rely on static petitions or
                chaotic comment sections. Last2Lines introduces a
                constraints-based framework that changes how we engage with
                global issues:
              </p>
              <ul className="flex flex-col gap-4">
                <li className="rounded-lg border border-border/60 bg-muted/30 p-5">
                  <h3 className="font-medium text-foreground">
                    Radical Inclusivity
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                    Writing an entire essay or poem can feel intimidating.
                    Writing just two lines (a couplet) takes only a moment,
                    leveling the playing field between seasoned wordsmiths and
                    everyday citizens.
                  </p>
                </li>
                <li className="rounded-lg border border-border/60 bg-muted/30 p-5">
                  <h3 className="font-medium text-foreground">
                    The Art of Distillation
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                    The 100-character-per-line limit forces contributors to
                    bypass reactionary outrage and distill their raw anxieties,
                    hopes, and experiences into pure, high-impact artistic
                    expressions.
                  </p>
                </li>
                <li className="rounded-lg border border-border/60 bg-muted/30 p-5">
                  <h3 className="font-medium text-foreground">
                    A Unified Canvas
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                    Instead of thousands of disconnected comments, your lines are
                    seamlessly stitched to the contribution before and after
                    yours. You are never standing alone; you are structurally
                    part of a larger collective movement.
                  </p>
                </li>
              </ul>
            </section>

            <section className="flex flex-col gap-4 border-t border-border/60 pt-10">
              <p className="text-base leading-relaxed text-muted-foreground text-pretty">
                From environmental conservation to global solidarity movements,
                Last2Lines continues to launch targeted campaigns that capture
                the emotional heartbeat of turning points in human history. Every
                couplet submitted is a digital brick in a growing monument of
                shared human empathy.
              </p>
              <p className="text-lg leading-relaxed text-foreground text-pretty">
                Whether you consider yourself an artist, an activist, or simply
                someone who cares—your voice has a specific place in the thread.
                Add your two lines today.
              </p>
            </section>
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
