import type { Metadata } from "next"
import { Suspense } from "react"
import { SOLUTIONS_OVERVIEW, getSolution } from "@/content"
import { SolutionsTimeline, type SolutionItem } from "@/components/sections/SolutionsTimeline"
import { SectionStyleProvider } from "@/components/sections/SectionStyle"
import { resolveSectionImages, resolveSectionStyles } from "@/lib/server/sections"

export const metadata: Metadata = {
  title: "Nos solutions",
  description:
    "Mobilier hospitalier, de laboratoire et d'accueil, prototypes, composantes architecturales et pièces sur mesure — des solutions métalliques adaptées à chaque secteur.",
}

// Toute la copie des anciennes pages /solutions/[slug] est désormais consolidée
// ici : on dérive un résumé utile (intro + points clés du 1er bloc list/feature)
// que l'index affiche dans un panneau « onglet » au clic. Plus de pages de détail.
function buildItems(): SolutionItem[] {
  return SOLUTIONS_OVERVIEW.index.map((it) => {
    const d = getSolution(it.slug)
    const block = d?.blocks.find((b) => b.kind === "list" || b.kind === "feature")
    const highlights =
      block?.kind === "list"
        ? block.items
        : block?.kind === "feature"
          ? block.points
          : []
    return { ...it, intro: d?.hero.intro ?? it.tagline, highlights }
  })
}

// Lit les overrides d'images publiés au moment de la requête (cartes + zoom de la
// timeline) — un publish depuis l'admin est reflété immédiatement.
export const dynamic = "force-dynamic"

export default async function SolutionsPage() {
  const { hero, closing } = SOLUTIONS_OVERVIEW
  const items = buildItems()
  const [images, styles] = await Promise.all([
    resolveSectionImages("solutions"),
    resolveSectionStyles("solutions"),
  ])

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

      <Suspense fallback={null}>
        <SectionStyleProvider styles={styles}>
          <SolutionsTimeline items={items} images={images} />
        </SectionStyleProvider>
      </Suspense>

      {/* Closing statement */}
      <section data-header-theme="light" className="bg-background pb-28 pt-10 md:pb-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <p className="max-w-[26ch] font-display text-[clamp(1.75rem,4vw,3rem)] font-medium leading-[1.12] tracking-[-0.01em] text-foreground">
            {closing.heading}
          </p>
        </div>
      </section>
    </>
  )
}
