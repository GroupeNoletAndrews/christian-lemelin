"use client"

import { motion } from "motion/react"
import { Eyebrow } from "@/components/ui/Eyebrow"
import { ArrowLink } from "@/components/ui/ArrowLink"
import { ParallaxImage } from "@/components/ui/ParallaxImage"

const sectors = [
  {
    id: "restauration",
    title: "Restauration & hôtellerie",
    description:
      "Comptoirs, hottes et équipements en inox sur mesure pour cuisines professionnelles des plus exigeantes.",
    href: "/solutions",
    img: "https://picsum.photos/seed/ecl-restaurant-kitchen-stainless/1200/800",
  },
  {
    id: "architecture",
    title: "Architecture & design",
    description:
      "Rampes, balustrades, panneaux décoratifs en inox, laiton et cuivre pour les projets d'exception.",
    href: "/solutions",
    img: "https://picsum.photos/seed/ecl-architecture-metal-facade/1200/800",
  },
  {
    id: "industrie",
    title: "Industrie & manufacturier",
    description:
      "Pièces de précision, gabarits, structures et composants pour la production industrielle.",
    href: "/solutions",
    img: "https://picsum.photos/seed/ecl-industrial-manufacturing-parts/1200/800",
  },
  {
    id: "commercial",
    title: "Commercial & institutionnel",
    description:
      "Signalétique, mobilier métallique et plafonds pour espaces commerciaux et bâtiments institutionnels.",
    href: "/solutions",
    img: "https://picsum.photos/seed/ecl-commercial-metal-interior/1200/800",
  },
]

export function Solutions() {
  return (
    <section data-header-theme="dark" className="bg-ink py-24 text-white md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow dark>Nos solutions</Eyebrow>
            <h2 className="mt-6 max-w-[16ch] font-display text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-white">
              Un secteur, ses exigences.
            </h2>
          </div>
          <p className="max-w-[44ch] leading-relaxed text-white/55">
            De la cuisine professionnelle à la façade architecturale, chaque
            secteur a ses contraintes. Nous les connaissons toutes.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {sectors.map((sector, i) => (
            <motion.div
              key={sector.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {/* TODO: replace with actual sector photography */}
                <ParallaxImage
                  src={sector.img}
                  alt={sector.title}
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-7 md:p-9">
                <h3 className="font-display text-2xl font-medium leading-tight text-white">
                  {sector.title}
                </h3>
                <p className="mt-3 max-w-[44ch] flex-1 leading-relaxed text-white/55">
                  {sector.description}
                </p>
                <ArrowLink href={sector.href} dark className="mt-6">
                  Explorer
                </ArrowLink>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
