"use client"

import { useEffect, useRef } from "react"
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"
import { INSTALLATIONS, imageUrl } from "@/content"
import { ParallaxImage } from "@/components/ui/ParallaxImage"

// Page /installations — capacité de fabrication. Réutilise le compteur animé
// (façon StatsBar), le parallax et le bloc « feature » sombre. Voir DESIGN.md.

function groupFr(v: number) {
  return Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

function parseStat(value: string) {
  const m = value.match(/^(\D*?)([\d\s.,]*\d)(\D*)$/)
  if (!m) return { prefix: "", target: 0, suffix: value }
  return { prefix: m[1], target: parseInt(m[2].replace(/\D/g, ""), 10) || 0, suffix: m[3] }
}

function StatCount({ value }: { value: string }) {
  const { prefix, target, suffix } = parseStat(value)
  const reduce = useReducedMotion()
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const count = useMotionValue(reduce ? target : 0)
  const text = useTransform(count, (v) => `${prefix}${groupFr(v)}${suffix}`)

  useEffect(() => {
    if (!inView || reduce) return
    const c = animate(count, target, { duration: 1.8, ease: [0.22, 1, 0.36, 1] })
    return () => c.stop()
  }, [inView, reduce, target, count])

  return (
    <motion.p
      ref={ref}
      className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-none tracking-[-0.03em] text-foreground tabular-nums"
    >
      {text}
    </motion.p>
  )
}

export function Installations() {
  const { hero, capabilities, stats, eco, partner } = INSTALLATIONS

  return (
    <>
      {/* Hero */}
      <section data-header-theme="light" className="bg-background pt-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <h1 className="max-w-[20ch] font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.0] tracking-[-0.02em] text-foreground">
            {hero.heading}
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-foreground-muted">
            {hero.intro}
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-[1400px] px-6 md:mt-16 md:px-12">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.5rem] border border-border md:aspect-[21/9] md:rounded-[2rem]">
            <ParallaxImage
              src={imageUrl(hero.image, 2000, 1100)}
              alt={hero.heading}
              sizes="100vw"
              amount={12}
            />
          </div>
        </div>
      </section>

      {/* Capacités + stats */}
      <section data-header-theme="light" className="bg-background py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.01em] text-foreground">
                Une maîtrise technologique au service de la performance.
              </h2>
              <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10">
                {stats.map((s) => (
                  <div key={s.label}>
                    <StatCount value={s.value} />
                    <p className="mt-3 max-w-[18ch] text-sm leading-relaxed text-foreground-muted">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              {capabilities.map((c) => (
                <div
                  key={c.title}
                  className="border-t border-border py-5 md:grid md:grid-cols-[1fr_1.2fr] md:gap-8 md:py-6"
                >
                  <h3 className="font-display text-lg font-medium text-foreground md:text-xl">
                    {c.title}
                  </h3>
                  <p className="mt-2 max-w-[48ch] leading-relaxed text-foreground-muted md:mt-0">
                    {c.body}
                  </p>
                </div>
              ))}
              <div className="border-t border-border" />
            </div>
          </div>
        </div>
      </section>

      {/* Éco — bloc feature sombre */}
      <section data-header-theme="dark" className="bg-background px-3 py-3 md:px-4 md:py-4">
        <div className="overflow-hidden rounded-[1.75rem] bg-ink md:rounded-[2.5rem]">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[300px] lg:min-h-[540px]">
              <ParallaxImage
                src={imageUrl(eco.image, 1400, 1400)}
                alt={eco.heading}
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/30" />
            </div>
            <div className="flex flex-col justify-center px-6 py-14 md:px-12 md:py-20">
              <h2 className="max-w-[18ch] font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-[1.08] text-white">
                {eco.heading}
              </h2>
              <p className="mt-5 max-w-[48ch] leading-relaxed text-white/65">{eco.intro}</p>
              <div className="mt-8">
                {eco.points.map((pt) => (
                  <div key={pt.title} className="border-t border-white/12 py-5">
                    <h3 className="font-display text-base font-medium text-white md:text-lg">
                      {pt.title}
                    </h3>
                    <p className="mt-1.5 max-w-[46ch] text-sm leading-relaxed text-white/55">
                      {pt.body}
                    </p>
                  </div>
                ))}
                <div className="border-t border-white/12" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partenaire — split */}
      <section data-header-theme="light" className="bg-background py-20 md:py-28">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-6 md:px-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
            <ParallaxImage
              src={imageUrl(partner.image, 1200, 900)}
              alt={partner.heading}
              sizes="(min-width: 1024px) 45vw, 90vw"
            />
          </div>
          <div>
            <h2 className="max-w-[20ch] font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.01em] text-foreground">
              {partner.heading}
            </h2>
            <p className="mt-6 max-w-[52ch] leading-relaxed text-foreground-muted">
              {partner.body}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
