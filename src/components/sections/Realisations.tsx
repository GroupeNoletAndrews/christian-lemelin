"use client"

import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react"

const projects = [
  {
    id: "r01",
    title: "Cuisine centrale CHU de Québec",
    category: "Restauration",
    material: "Inox 316L",
    year: "2024",
    img: "https://picsum.photos/seed/ecl-project-hospital-kitchen-stainless/800/600",
  },
  {
    id: "r02",
    title: "Facade laiton - Place Ste-Foy",
    category: "Architecture",
    material: "Laiton C360",
    year: "2024",
    img: "https://picsum.photos/seed/ecl-project-brass-facade-building/800/600",
  },
  {
    id: "r03",
    title: "Balustrades acier - Villa privée",
    category: "Résidentiel",
    material: "Acier peint",
    year: "2023",
    img: "https://picsum.photos/seed/ecl-project-steel-railing-villa/800/600",
  },
  {
    id: "r04",
    title: "Comptoir bar - Hôtel Le Château",
    category: "Hôtellerie",
    material: "Inox miroir",
    year: "2023",
    img: "https://picsum.photos/seed/ecl-project-hotel-bar-counter/800/600",
  },
  {
    id: "r05",
    title: "Structure industrielle - Aluminerie",
    category: "Industrie",
    material: "Acier A36",
    year: "2023",
    img: "https://picsum.photos/seed/ecl-project-industrial-structure/800/600",
  },
  {
    id: "r06",
    title: "Plafond cuivre - Boutique design",
    category: "Commercial",
    material: "Cuivre C110",
    year: "2022",
    img: "https://picsum.photos/seed/ecl-project-copper-ceiling-retail/800/600",
  },
]

export function Realisations() {
  return (
    <section data-header-theme="light" className="bg-[#f3f3f1] py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="flex items-end justify-between mb-14 flex-wrap gap-5">
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-zinc-900 uppercase tracking-[0.06em] leading-none">
            Réalisations
          </h2>
          <Link
            href="/realisations"
            className="inline-flex items-center gap-2 text-[13px] font-sans font-medium text-accent hover:text-accent-hover transition-colors duration-200 group"
          >
            Voir tout
            <ArrowRight
              size={13}
              weight="bold"
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </Link>
        </div>

        {/* Grid: 3-col desktop, 2-col tablet, 1-col mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5">
          {projects.map((project, i) => (
            <motion.article
              key={project.id}
              className="group relative aspect-[4/3] overflow-hidden cursor-pointer"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: i * 0.055 }}
            >
              {/* TODO: replace with actual project photography */}
              <Image
                src={project.img}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />

              {/* Overlay — intensifies on hover */}
              <div
                className="absolute inset-0 transition-opacity duration-300 opacity-75 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(to top, rgb(9 9 11 / 0.92) 0%, rgb(9 9 11 / 0.15) 55%, transparent 100%)",
                }}
              />

              {/* Info — slides up on hover */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="translate-y-1.5 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="text-[10px] font-sans tracking-[0.12em] text-accent/80 uppercase">
                      {project.category}
                    </span>
                    <span className="text-white/20 font-mono text-[9px]">/</span>
                    <span className="text-[10px] font-mono text-white/35 tracking-[0.1em]">
                      {project.material}
                    </span>
                  </div>
                  <h3 className="font-display text-[1rem] text-white uppercase tracking-[0.04em] leading-tight">
                    {project.title}
                  </h3>
                  <p className="font-mono text-[10px] text-white/30 tracking-[0.15em] mt-2">
                    {project.year}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
