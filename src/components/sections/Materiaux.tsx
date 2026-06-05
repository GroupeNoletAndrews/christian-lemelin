"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "motion/react"
import Image from "next/image"
import { ParallaxImage } from "@/components/ui/ParallaxImage"
import { MATERIALS as materials, imageUrl } from "@/content"

gsap.registerPlugin(ScrollTrigger)

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
    <section data-header-theme="light" className="bg-background">
      {/* Mobile: vertical stack of contained cards */}
      <div className="md:hidden">
        <div className="px-6 pb-10 pt-24">
          <h2 className="font-display text-[clamp(2rem,9vw,2.75rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-foreground">
            Une maîtrise complète de la gamme.
          </h2>
        </div>
        <div className="flex flex-col gap-6 px-6 pb-16">
          {materials.map((mat) => (
            <article key={mat.code}>
              <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-border">
                {/* TODO: replace with actual material photography / GLB */}
                <ParallaxImage src={imageUrl(mat.cardImage, 900, 1100)} alt={mat.name} sizes="100vw" />
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-mono text-xs tracking-[0.2em] text-foreground-muted">{mat.code}</span>
                <h3 className="font-display text-2xl font-semibold text-foreground">{mat.shortName}</h3>
              </div>
              <p className="mt-1 text-sm text-foreground-muted">{mat.fullName}</p>
            </article>
          ))}
        </div>
      </div>

      {/* Desktop: horizontal scroll carousel */}
      <div ref={wrapRef} className="relative hidden overflow-hidden md:block">
        <div ref={trackRef} className="flex h-[100dvh] items-center">
          {/* Intro panel */}
          <div className="flex h-full w-[40vw] shrink-0 flex-col justify-center px-14 xl:px-20">
            <h2 className="font-display text-[clamp(2.25rem,3.8vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-foreground">
              Une maîtrise complète de la gamme.
            </h2>
            <p className="mt-6 max-w-[36ch] leading-relaxed text-foreground-muted">
              Inox, acier, aluminium, laiton et cuivre, travaillés avec la même
              exigence depuis des décennies.
            </p>
            <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6">
              {materials.map((mat) => (
                <div key={mat.code} className="flex items-center gap-4 font-mono text-xs tracking-[0.12em]">
                  <span className="flex-1 text-foreground">{mat.shortName}</span>
                  <span className="text-foreground-muted">{mat.code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Material cards */}
          {materials.map((mat) => (
            <div key={mat.code} className="flex h-full w-[34vw] shrink-0 flex-col justify-center px-6">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border">
                {/* TODO: replace with actual material photography / interactive GLB */}
                <Image src={imageUrl(mat.cardImage, 900, 1100)} alt={mat.name} fill className="object-cover" sizes="34vw" />
              </div>
              <div className="mt-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs tracking-[0.2em] text-foreground-muted">{mat.code}</span>
                  <h3 className="font-display text-[clamp(1.75rem,2.4vw,2.5rem)] font-semibold leading-none text-foreground">
                    {mat.shortName}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-foreground-muted">{mat.fullName}</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
                  {mat.properties.map((prop) => (
                    <span key={prop} className="text-[13px] text-foreground-muted">
                      {prop}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
