import { SlotParallaxImage } from "@/components/sections/SlotParallaxImage"
import { imageUrl, type DetailHero as DetailHeroContent } from "@/content"
import { heroSlot } from "@/lib/sections-registry"

// Hero des pages de détail : image parallax plein cadre + scrim sombre, contenu
// ancré en bas (titre + intro). data-header-theme="dark" pour l'inversion du logo.
// L'image est éditable (slot <slug>/hero de la section materiaux | solutions).
export function DetailHero({
  hero,
  section,
  slug,
  images = {},
}: {
  hero: DetailHeroContent
  section: string
  slug: string
  images?: Record<string, string>
}) {
  const slot = heroSlot(slug)
  const src = images[slot] ?? imageUrl(hero.image, 2000, 1400)
  return (
    <section data-header-theme="dark" className="relative">
      <div className="relative h-[68svh] min-h-[440px] w-full overflow-hidden bg-ink">
        <SlotParallaxImage
          section={section}
          slot={slot}
          src={src}
          alt={hero.heading}
          sizes="100vw"
          amount={14}
        />
        <div className="pointer-events-none absolute inset-0 bg-black/40" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />

        <div className="absolute inset-0 z-10 flex items-end">
          <div className="mx-auto w-full max-w-[1400px] px-6 pb-14 md:px-12 md:pb-20">
            <h1 className="max-w-[18ch] font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.0] tracking-[-0.02em] text-white">
              {hero.heading}
            </h1>
            <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-white/75">
              {hero.intro}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
