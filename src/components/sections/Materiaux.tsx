"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "motion/react"
import Image from "next/image"

gsap.registerPlugin(ScrollTrigger)

const materials = [
  {
    code: "316L",
    name: "Inox",
    fullName: "Acier inoxydable",
    properties: ["Résistant à la corrosion", "Hygiénique & alimentaire", "Haute durabilité"],
    img: "https://picsum.photos/seed/ecl-stainless-steel-mirror/900/1100",
  },
  {
    code: "A36",
    name: "Acier",
    fullName: "Acier structurel",
    properties: ["Haute résistance", "Soudable partout", "Économique"],
    img: "https://picsum.photos/seed/ecl-structural-steel-plate/900/1100",
  },
  {
    code: "6061",
    name: "Aluminium",
    fullName: "Aluminium série 6000",
    properties: ["Léger", "Anti-corrosion naturel", "Usinable"],
    img: "https://picsum.photos/seed/ecl-aluminum-brushed-profile/900/1100",
  },
  {
    code: "C360",
    name: "Laiton",
    fullName: "Laiton & bronze",
    properties: ["Teintes chaudes", "Décoratif", "Finition premium"],
    img: "https://picsum.photos/seed/ecl-brass-decorative-interior/900/1100",
  },
  {
    code: "C110",
    name: "Cuivre",
    fullName: "Cuivre pur",
    properties: ["Patine unique", "Antimicrobien", "Architectural"],
    img: "https://picsum.photos/seed/ecl-copper-facade-detail/900/1100",
  },
]

export function Materiaux() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || !wrapRef.current || !trackRef.current) return
    const ctx = gsap.context(() => {
      const distance = trackRef.current!.scrollWidth - window.innerWidth
      gsap.to(trackRef.current, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    }, wrapRef)
    return () => ctx.revert()
  }, [reduce])

  return (
    <section data-header-theme="light" className="bg-[#f3f3f1]">

      {/* Mobile: vertical stack */}
      <div className="md:hidden">
        <div className="px-6 pt-20 pb-10 border-t border-black/8">
          <p className="font-display text-[0.75rem] text-zinc-400 uppercase tracking-[0.18em] mb-6">
            Matériaux
          </p>
          <h2 className="font-display text-[2rem] text-zinc-900 uppercase tracking-[0.08em] leading-[1.05]">
            Maitrise<br />complète
          </h2>
        </div>
        <div className="flex flex-col gap-0.5">
          {materials.map((mat) => (
            <div key={mat.code} className="relative h-[56vw] overflow-hidden">
              {/* TODO: replace with actual material photography */}
              <Image
                src={mat.img}
                alt={mat.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgb(243 243 241 / 0.95) 0%, rgb(243 243 241 / 0.45) 55%, transparent 100%)",
                }}
              />
              <div className="absolute bottom-0 left-0 p-5">
                <p className="font-mono text-[10px] text-accent/70 tracking-[0.3em] mb-1">
                  {mat.code}
                </p>
                <p className="font-display text-[1.6rem] text-zinc-900 uppercase tracking-[0.08em] leading-none">
                  {mat.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: horizontal scroll hijack */}
      <div ref={wrapRef} className="hidden md:block relative overflow-hidden">
        <div ref={trackRef} className="flex h-[100dvh] items-stretch">

          {/* Intro panel */}
          <div className="shrink-0 w-[38vw] flex flex-col justify-center px-14 xl:px-20 border-r border-black/8">
            <p className="font-display text-[0.7rem] text-zinc-400 uppercase tracking-[0.18em] mb-8">
              Matériaux
            </p>
            <h2 className="font-display text-[clamp(2.25rem,3.8vw,3.25rem)] text-zinc-900 uppercase tracking-[0.07em] leading-[1.05] mb-6">
              Maitrise<br />complète<br />de la gamme
            </h2>
            <p className="text-sm text-zinc-500 font-sans leading-relaxed max-w-[30ch] mb-12">
              Inox, acier, aluminium, laiton et cuivre travaillés avec la même exigence depuis des décennies.
            </p>
            {/* Material index */}
            <div className="flex flex-col gap-2.5">
              {materials.map((mat, i) => (
                <div
                  key={mat.code}
                  className="flex items-center gap-3 font-mono text-[10px] tracking-[0.15em]"
                >
                  <span className="text-accent/60">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-zinc-400 uppercase">{mat.name}</span>
                  <span className="text-zinc-300">{mat.code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Material panels */}
          {materials.map((mat) => (
            <div
              key={mat.code}
              className="shrink-0 w-[58vw] relative overflow-hidden border-r border-black/8"
            >
              {/* TODO: replace src with actual material photography or 3D model GIF */}
              <Image
                src={mat.img}
                alt={mat.name}
                fill
                className="object-cover"
                sizes="58vw"
              />
              {/* Light wash from left — photo shows on the right */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, rgb(243 243 241 / 0.95) 0%, rgb(243 243 241 / 0.65) 36%, transparent 68%)",
                }}
              />
              <div className="absolute inset-0 flex items-end p-12 xl:p-16">
                <div>
                  <p className="font-mono text-[10px] text-accent/70 tracking-[0.32em] mb-4 uppercase">
                    {mat.code}
                  </p>
                  <h3 className="font-display text-[clamp(3rem,5.5vw,4.5rem)] text-zinc-900 uppercase tracking-[0.05em] leading-none mb-2">
                    {mat.name}
                  </h3>
                  <p className="text-sm text-zinc-500 font-sans mb-8">
                    {mat.fullName}
                  </p>
                  <div className="grid grid-cols-3 gap-5 max-w-[460px]">
                    {mat.properties.map((prop) => (
                      <div key={prop} className="border-t border-black/12 pt-3">
                        <p className="text-[11px] text-zinc-600 font-sans leading-snug">
                          {prop}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
