"use client"

import { motion } from "motion/react"
import { ArrowLink } from "@/components/ui/ArrowLink"
import { ParallaxImage } from "@/components/ui/ParallaxImage"

const projects = [
  {
    id: "r01",
    title: "Cuisine centrale CHU de Québec",
    category: "Restauration",
    material: "Inox 316L",
    img: "https://picsum.photos/seed/ecl-project-hospital-kitchen-stainless/900/700",
    ratio: "aspect-[4/3]",
  },
  {
    id: "r02",
    title: "Façade laiton — Place Ste-Foy",
    category: "Architecture",
    material: "Laiton C360",
    img: "https://picsum.photos/seed/ecl-project-brass-facade-building/900/1100",
    ratio: "aspect-[4/5]",
  },
  {
    id: "r03",
    title: "Balustrades acier — Villa privée",
    category: "Résidentiel",
    material: "Acier peint",
    img: "https://picsum.photos/seed/ecl-project-steel-railing-villa/900/1100",
    ratio: "aspect-[4/5]",
  },
  {
    id: "r04",
    title: "Comptoir bar — Hôtel Le Château",
    category: "Hôtellerie",
    material: "Inox miroir",
    img: "https://picsum.photos/seed/ecl-project-hotel-bar-counter/900/700",
    ratio: "aspect-[4/3]",
  },
  {
    id: "r05",
    title: "Structure industrielle — Aluminerie",
    category: "Industrie",
    material: "Acier A36",
    img: "https://picsum.photos/seed/ecl-project-industrial-structure/900/700",
    ratio: "aspect-[4/3]",
  },
  {
    id: "r06",
    title: "Plafond cuivre — Boutique design",
    category: "Commercial",
    material: "Cuivre C110",
    img: "https://picsum.photos/seed/ecl-project-copper-ceiling-retail/900/1100",
    ratio: "aspect-[4/5]",
  },
]

export function Realisations() {
  return (
    <section
      data-header-theme="light"
      className="bg-background py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-foreground">
              Quelques projets récents.
            </h2>
          </div>
          <ArrowLink href="/realisations">Voir tout</ArrowLink>
        </div>

        {/* Masonry */}
        <div className="mt-14 gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
          {projects.map((project, i) => (
            <motion.article
              key={project.id}
              className="group mb-6 break-inside-avoid"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
            >
              <div className={`relative ${project.ratio} overflow-hidden rounded-2xl border border-border`}>
                {/* TODO: replace with actual project photography */}
                <ParallaxImage
                  src={project.img}
                  alt={project.title}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <div className="mt-4">
                <h3 className="font-display text-xl font-medium leading-tight text-foreground">
                  {project.title}
                </h3>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
