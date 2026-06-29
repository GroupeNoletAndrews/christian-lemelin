import type { Metadata } from "next"
import { SOLUTIONS_OVERVIEW } from "@/content"
import { SolutionsIndex } from "@/components/sections/SolutionsIndex"
import { ContactCTA } from "@/components/sections/ContactCTA"
import { resolveSectionImages } from "@/lib/server/sections"

export const metadata: Metadata = {
  title: "Nos solutions",
  description:
    "Mobilier hospitalier, de laboratoire et d'accueil, prototypes, composantes architecturales et pièces sur mesure — des solutions métalliques adaptées à chaque secteur.",
}

// Reads published Solutions image overrides at request time (index hover previews).
export const dynamic = "force-dynamic"

export default async function SolutionsPage() {
  const { hero, closing } = SOLUTIONS_OVERVIEW
  const images = await resolveSectionImages("solutions")

  return (
    <>
      {/* Hero */}
      <section data-header-theme="light" className="bg-background pb-12 pt-40 md:pb-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <h1 className="max-w-[20ch] font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.0] tracking-[-0.02em] text-foreground">
            {hero.heading}
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-foreground-muted">
            {hero.intro}
          </p>
          <div className="mt-12 md:mt-16">
            {hero.points.map((p) => (
              <div
                key={p.title}
                className="border-t border-border py-6 md:grid md:grid-cols-[1fr_1.4fr] md:gap-8"
              >
                <h2 className="font-display text-lg font-medium text-foreground md:text-xl">
                  {p.title}
                </h2>
                <p className="mt-2 max-w-[54ch] leading-relaxed text-foreground-muted md:mt-0">
                  {p.body}
                </p>
              </div>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      <SolutionsIndex images={images} />

      {/* Closing statement */}
      <section data-header-theme="light" className="bg-background pb-28 pt-10 md:pb-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <p className="max-w-[26ch] font-display text-[clamp(1.75rem,4vw,3rem)] font-medium leading-[1.12] tracking-[-0.01em] text-foreground">
            {closing.heading}
          </p>
        </div>
      </section>

      <ContactCTA
        heading="Une solution sur mesure pour votre établissement ?"
        body="Parlons de vos besoins — de la conception à l'installation, partout au Québec."
      />
    </>
  )
}
