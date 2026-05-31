"use client"

import { useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react"

const ModelViewer = dynamic(
  () => import("@/components/ui/ModelViewer").then((m) => m.ModelViewer),
  { ssr: false }
)

gsap.registerPlugin(ScrollTrigger)

const services = [
  {
    id: "01",
    title: "Fabrication sur mesure",
    description:
      "Pièces uniques ou en série, réalisées selon vos plans ou développées avec notre équipe technique.",
    tags: ["Inox", "Acier", "Aluminium"],
    img: "https://picsum.photos/seed/ecl-fabrication-shop-metal/1600/900",
    href: "/fabrication",
  },
  {
    id: "02",
    title: "Découpe laser & plasma",
    description:
      "Précision au dixième de millimètre sur toutes épaisseurs, du prototype à la grande série.",
    tags: ["Laser CO₂", "Plasma CNC", "Jet d'eau"],
    img: "https://picsum.photos/seed/ecl-laser-cutting-industrial/1600/900",
    href: "/solutions",
  },
  {
    id: "03",
    title: "Soudure & assemblage",
    description:
      "Soudeurs certifiés MIG, TIG et structurale pour assemblages industriels et architecturaux exigeants.",
    tags: ["MIG / TIG", "Structurale", "Alimentaire"],
    img: "https://picsum.photos/seed/ecl-welding-arc-workshop/1600/900",
    href: "/solutions",
  },
  {
    id: "04",
    title: "Polissage & finitions",
    description:
      "Miroir, satiné, brossé, poudré. Chaque finition exécutée en atelier selon les standards les plus exigeants.",
    tags: ["Miroir", "Satiné", "Brossé"],
    img: "https://picsum.photos/seed/ecl-polished-steel-surface/1600/900",
    href: "/fabrication",
  },
  {
    id: "05",
    title: "Installation sur site",
    description:
      "Équipe dédiée partout au Québec. Livraison coordonnée, pose soignée, résultat garanti.",
    tags: ["Québec", "Coordonné", "Garanti"],
    img: "https://picsum.photos/seed/ecl-installation-commercial/1600/900",
    href: "/a-propos",
  },
]

const total = String(services.length).padStart(2, "0")

export function SavoirFaire() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || !containerRef.current) return
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".sf-card")
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return

        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cards[cards.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        })
      })
    }, containerRef)
    return () => ctx.revert()
  }, [reduce])

  return (
    <section data-header-theme="light" className="relative bg-[#f3f3f1]">
      {/* Section label */}
      <div className="px-6 md:px-12 pt-20 pb-6">
        <div className="max-w-[1400px] mx-auto border-t border-black/8 pt-10">
          <p className="font-display text-[0.75rem] text-zinc-400 uppercase tracking-[0.18em]">
            Savoir-faire
          </p>
        </div>
      </div>

      {/* Sticky stack */}
      <div ref={containerRef}>
        {services.map((service, i) => (
          <div
            key={service.id}
            className="sf-card relative min-h-[100dvh] w-full overflow-hidden will-change-transform bg-[#f3f3f1]"
            style={{ zIndex: i + 1 }}
          >
            {i === 0 ? (
              /* First card — 3D model on the right, desktop only */
              <div className="absolute inset-y-0 right-0 w-[58%] hidden lg:block">
                <ModelViewer />
              </div>
            ) : (
              /* Other cards — full-bleed background image */
              <div className="absolute inset-0">
                <Image
                  src={service.img}
                  alt={service.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, rgb(243 243 241 / 0.97) 0%, rgb(243 243 241 / 0.90) 40%, rgb(243 243 241 / 0.40) 66%, transparent 100%)",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgb(243 243 241 / 0.65) 0%, transparent 42%)",
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className="relative z-10 flex min-h-[100dvh] items-center">
              <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 py-24">
                <div className="max-w-[520px]">
                  <p className="font-mono text-[10px] text-accent/70 tracking-[0.32em] mb-8 uppercase">
                    {service.id}&nbsp;/&nbsp;{total}
                  </p>

                  <h2 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] text-zinc-900 uppercase tracking-[0.06em] leading-[1.05] mb-5">
                    {service.title}
                  </h2>

                  <p className="text-[0.9375rem] text-zinc-600 font-sans leading-relaxed mb-8 max-w-[42ch]">
                    {service.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-10">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-[10px] font-sans tracking-[0.12em] text-zinc-500 border border-black/15 uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-2.5 text-[13px] font-sans font-medium text-accent hover:text-accent-hover transition-colors duration-200 group"
                  >
                    En savoir plus
                    <ArrowRight
                      size={13}
                      weight="bold"
                      className="group-hover:translate-x-1 transition-transform duration-200"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
