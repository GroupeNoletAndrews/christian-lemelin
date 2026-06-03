"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Minus } from "@phosphor-icons/react"
import { Eyebrow } from "@/components/ui/Eyebrow"
import { ArrowLink } from "@/components/ui/ArrowLink"
import { Tag } from "@/components/ui/Tag"

const services = [
  {
    id: "01",
    title: "Fabrication sur mesure",
    description:
      "Pièces uniques ou en série, réalisées selon vos plans ou développées avec notre équipe technique.",
    tags: ["Inox", "Acier", "Aluminium"],
    img: "https://picsum.photos/seed/ecl-fabrication-shop-metal/1200/1500",
    href: "/fabrication",
  },
  {
    id: "02",
    title: "Découpe laser & plasma",
    description:
      "Précision au dixième de millimètre sur toutes épaisseurs, du prototype à la grande série.",
    tags: ["Laser CO₂", "Plasma CNC", "Jet d'eau"],
    img: "https://picsum.photos/seed/ecl-laser-cutting-industrial/1200/1500",
    href: "/solutions",
  },
  {
    id: "03",
    title: "Soudure & assemblage",
    description:
      "Soudeurs certifiés MIG, TIG et structurale pour assemblages industriels et architecturaux exigeants.",
    tags: ["MIG / TIG", "Structurale", "Alimentaire"],
    img: "https://picsum.photos/seed/ecl-welding-arc-workshop/1200/1500",
    href: "/solutions",
  },
  {
    id: "04",
    title: "Polissage & finitions",
    description:
      "Miroir, satiné, brossé, poudré. Chaque finition exécutée en atelier selon les standards les plus exigeants.",
    tags: ["Miroir", "Satiné", "Brossé"],
    img: "https://picsum.photos/seed/ecl-polished-steel-surface/1200/1500",
    href: "/fabrication",
  },
  {
    id: "05",
    title: "Installation sur site",
    description:
      "Équipe dédiée partout au Québec. Livraison coordonnée, pose soignée, résultat garanti.",
    tags: ["Québec", "Coordonné", "Garanti"],
    img: "https://picsum.photos/seed/ecl-installation-commercial/1200/1500",
    href: "/a-propos",
  },
]

export function SavoirFaire() {
  const [open, setOpen] = useState(0)

  return (
    <section
      data-header-theme="light"
      className="border-t border-border bg-surface py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <Eyebrow>Savoir-faire</Eyebrow>
        <h2 className="mt-6 max-w-[18ch] font-display text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-foreground">
          Voici comment nous donnons forme au métal.
        </h2>

        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-[1fr_minmax(360px,40%)]">
          {/* Numbered accordion */}
          <div className="border-t border-border">
            {services.map((s, i) => {
              const isOpen = open === i
              return (
                <div key={s.id} className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-center gap-5 py-6 text-left md:gap-8"
                    aria-expanded={isOpen}
                  >
                    <span className="font-mono text-sm text-foreground-muted">
                      {s.id}
                    </span>
                    <span className="flex-1 font-display text-[clamp(1.4rem,3.2vw,2.5rem)] font-medium leading-tight text-foreground">
                      {s.title}
                    </span>
                    <span className="text-foreground-muted">
                      {isOpen ? <Minus size={22} /> : <Plus size={22} />}
                    </span>
                  </button>

                  <div
                    className={`grid overflow-hidden transition-all duration-300 ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0">
                      <div className="pb-8 pl-9 pr-4 md:pl-[3.75rem]">
                        <p className="max-w-[52ch] leading-relaxed text-foreground-muted">
                          {s.description}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {s.tags.map((t) => (
                            <Tag key={t}>{t}</Tag>
                          ))}
                        </div>
                        <ArrowLink href={s.href} className="mt-6">
                          En savoir plus
                        </ArrowLink>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Contained visual of the open service */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border">
                {/* TODO: replace with actual photography of each service */}
                <Image
                  src={services[open === -1 ? 0 : open].img}
                  alt={services[open === -1 ? 0 : open].title}
                  fill
                  className="object-cover"
                  sizes="40vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
