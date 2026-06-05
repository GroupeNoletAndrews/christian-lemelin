import { ParallaxImage } from "@/components/ui/ParallaxImage"
import { imageUrl, type ImageRef } from "@/content"

// Bande de réalisations : grille d'images parallax (ratios variés) — pas de
// carte, juste des cadres arrondis hairline. Voir DESIGN.md §7.
export function GalleryStrip({
  heading,
  images,
}: {
  heading?: string
  images: ImageRef[]
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
          {images.map((img, i) => (
            <div
              key={`${img.seed}-${i}`}
              className={`relative overflow-hidden rounded-2xl border border-border ${
                i % 4 === 0 ? "aspect-[3/4]" : "aspect-square"
              }`}
            >
              <ParallaxImage
                src={imageUrl(img, 800, 1000)}
                alt={img.alt}
                sizes="(min-width: 768px) 25vw, 50vw"
                amount={12}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
