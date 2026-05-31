"use client"

import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "@phosphor-icons/react"

const sectors = [
  {
    id: "restauration",
    title: "Restauration & hôtellerie",
    description:
      "Comptoirs, hottes et équipements en inox sur mesure pour cuisines professionnelles des plus exigeantes.",
    href: "/solutions",
    img: "https://picsum.photos/seed/ecl-restaurant-kitchen-stainless/1200/800",
    colSpan: "lg:col-span-2",
    minH: "min-h-[320px] lg:min-h-[400px]",
  },
  {
    id: "architecture",
    title: "Architecture & design",
    description:
      "Rampes, balustrades, panneaux décoratifs en inox, laiton et cuivre pour les projets d'exception.",
    href: "/solutions",
    img: "https://picsum.photos/seed/ecl-architecture-metal-facade/800/700",
    colSpan: "lg:col-span-1",
    minH: "min-h-[320px] lg:min-h-[400px]",
  },
  {
    id: "industrie",
    title: "Industrie & manufacturier",
    description:
      "Pièces de précision, gabarits, structures et composants pour la production industrielle.",
    href: "/solutions",
    img: "https://picsum.photos/seed/ecl-industrial-manufacturing-parts/800/700",
    colSpan: "lg:col-span-1",
    minH: "min-h-[280px] lg:min-h-[360px]",
  },
  {
    id: "commercial",
    title: "Commercial & institutionnel",
    description:
      "Signalétique, mobilier métallique et plafonds pour espaces commerciaux et bâtiments institutionnels.",
    href: "/solutions",
    img: "https://picsum.photos/seed/ecl-commercial-metal-interior/1200/700",
    colSpan: "lg:col-span-2",
    minH: "min-h-[280px] lg:min-h-[360px]",
  },
]

export function Solutions() {
  return (
    <section data-header-theme="light" className="bg-[#f3f3f1] py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">

        {/* Section header */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-zinc-900 uppercase tracking-[0.06em] leading-none">
            Nos solutions
          </h2>
          <p className="text-sm text-zinc-500 font-sans leading-relaxed max-w-[44ch]">
            De la cuisine professionnelle à la façade architecturale, chaque secteur a ses exigences. Nous les connaissons toutes.
          </p>
        </div>

        {/*
          Bento — 3-col desktop, 2-col tablet, 1-col mobile
          Row 1: [Restauration ×2] [Architecture ×1]
          Row 2: [Industrie ×1] [Commercial ×2]
          4 items, 4 cells, no empty cells.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5">
          {sectors.map((sector, i) => (
            <motion.div
              key={sector.id}
              className={`group relative overflow-hidden ${sector.colSpan} ${sector.minH}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* TODO: replace with actual sector photography */}
              <Image
                src={sector.img}
                alt={sector.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                sizes={
                  sector.colSpan === "lg:col-span-2"
                    ? "(min-width: 1024px) 66vw, (min-width: 768px) 50vw, 100vw"
                    : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                }
              />

              {/* Gradient overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background:
                    "linear-gradient(to top, rgb(9 9 11 / 0.92) 0%, rgb(9 9 11 / 0.45) 45%, rgb(9 9 11 / 0.10) 100%)",
                }}
              />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-8">
                <h3 className="font-display text-[1.15rem] md:text-[1.3rem] text-white uppercase tracking-[0.05em] leading-tight mb-2">
                  {sector.title}
                </h3>
                <p className="text-[12.5px] text-white/50 font-sans leading-relaxed max-w-[40ch] mb-5">
                  {sector.description}
                </p>
                <Link
                  href={sector.href}
                  className="inline-flex items-center gap-1.5 text-[12px] font-sans font-medium text-accent hover:text-accent-hover transition-colors duration-200 group/lnk w-fit"
                >
                  Explorer
                  <ArrowUpRight
                    size={12}
                    weight="bold"
                    className="group-hover/lnk:translate-x-0.5 group-hover/lnk:-translate-y-0.5 transition-transform duration-200"
                  />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
