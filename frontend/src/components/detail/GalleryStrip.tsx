import { SlotParallaxImage } from "@/components/sections/SlotParallaxImage"
import { imageUrl, type ImageRef } from "@/content"
import { gallerySlot } from "@/lib/sections-registry"

// Bande de réalisations : grille d'images parallax (ratios variés) — pas de
// carte, juste des cadres arrondis hairline. Chaque image est éditable
// (slot <slug>/g<blockIndex>-<i>). Voir DESIGN.md §7.
export function GalleryStrip({
  heading,
  images,
  section,
  slug,
  blockIndex,
  overrides = {},
}: {
  heading?: string
  images: ImageRef[]
  section: string
  slug: string
  blockIndex: number
  overrides?: Record<string, string>
}) {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {heading && (
          <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-medium tracking-[-0.01em] text-foreground">
            {heading}
          </h2>
        )}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {images.map((img, i) => {
            const slot = gallerySlot(slug, blockIndex, i)
            const src = overrides[slot] ?? imageUrl(img, 800, 1000)
            return (
              <div
                key={`${img.seed}-${i}`}
                className={`relative overflow-hidden rounded-2xl border border-border ${
                  i % 4 === 0 ? "aspect-[3/4]" : "aspect-square"
                }`}
              >
                <SlotParallaxImage
                  section={section}
                  slot={slot}
                  src={src}
                  alt={img.alt}
                  sizes="(min-width: 768px) 25vw, 50vw"
                  amount={12}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
