import { DetailHero } from "./DetailHero"
import { ContentBlocks } from "./ContentBlocks"
import { ExploreMore, type ExploreTile } from "./ExploreMore"
import type { ContentBlock, DetailHero as DetailHeroContent } from "@/content"

// Orchestration d'une page de détail (solution ou matériau) : hero → bandeau
// propriétés optionnel → blocs de contenu → clôture contextuelle ExploreMore
// (vignettes vers le contenu lié + ligne de contact). Pas de CTA générique
// répété ni de bande « réalisations » : voir DESIGN.md §7bis.
export function DetailLayout({
  hero,
  properties,
  blocks,
  explore,
}: {
  hero: DetailHeroContent
  properties?: string[]
  blocks: ContentBlock[]
  explore: {
    heading: string
    tiles: ExploreTile[]
    contactText: string
    contactHref?: string
    contactLabel?: string
  }
}) {
  return (
    <>
      <DetailHero hero={hero} />

      {properties && properties.length > 0 && (
        <section data-header-theme="light" className="bg-background pt-10 md:pt-14">
          <div className="mx-auto max-w-[1400px] px-6 md:px-12">
            <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-border pb-8">
              {properties.map((p) => (
                <span key={p} className="text-sm text-foreground-muted">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <ContentBlocks blocks={blocks} />

      <ExploreMore
        heading={explore.heading}
        tiles={explore.tiles}
        contactText={explore.contactText}
        contactHref={explore.contactHref}
        contactLabel={explore.contactLabel}
      />
    </>
  )
}
