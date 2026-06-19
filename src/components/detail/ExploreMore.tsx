import Link from "next/link"
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr"
import { ParallaxImage } from "@/components/ui/ParallaxImage"
import { ArrowLink } from "@/components/ui/ArrowLink"
import { imageUrl, type ImageRef } from "@/content"

// Clôture contextuelle des pages de détail — remplace le CTA générique répété
// et la bande « réalisations récentes ». Des vignettes-images vers le contenu
// LIÉ (donc différent et visuel sur chaque page), puis une ligne de contact
// contextuelle et légère. Voir DESIGN.md §7bis.
export type ExploreTile = { href: string; label: string; image: ImageRef }

export function ExploreMore({
  heading,
  tiles,
  contactText,
  contactHref = "/contact",
  contactLabel = "Nous joindre",
}: {
  heading: string
  tiles: ExploreTile[]
  contactText: string
  contactHref?: string
  contactLabel?: string
}) {
  return (
    <section data-header-theme="light" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {tiles.length > 0 && (
          <>
            <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-medium tracking-[-0.01em] text-foreground">
              {heading}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {tiles.map((t) => (
                <Link key={`${t.href}-${t.label}`} href={t.href} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
                    <ParallaxImage
                      src={imageUrl(t.image, 900, 700)}
                      alt={t.label}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      amount={12}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                      <span className="max-w-[16ch] font-display text-lg font-medium leading-tight text-white md:text-xl">
                        {t.label}
                      </span>
                      <ArrowUpRightIcon
                        size={22}
                        weight="bold"
                        className="shrink-0 text-accent transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Ligne de contact contextuelle — légère, pas le grand bloc répété */}
        <div className="mt-16 flex flex-col gap-5 border-t border-border pt-10 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-[22ch] font-display text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.01em] text-foreground">
            {contactText}
          </p>
          <ArrowLink href={contactHref} className="text-lg">
            {contactLabel}
          </ArrowLink>
        </div>
      </div>
    </section>
  )
}
