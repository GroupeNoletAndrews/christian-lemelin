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

const stats = [
  { value: "20+", label: "Années d'expertise" },
  { value: "2 400+", label: "Projets réalisés" },
  { value: "5", label: "Matériaux maîtrisés" },
  { value: "100%", label: "Fabriqué au Québec" },
]

// Placeholder partners (à remplacer par les vrais logos) — mêmes que le menu.
const partners = [
  "Atelier Nord",
  "Métalu QC",
  "Groupe Ferron",
  "InoxPro",
  "Usimétal",
  "Soudexpert",
  "Laurentide Métal",
]

// Same easing as the menu's drawing lines (Header.tsx) — "comme le menu bar".
const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

// French thousands grouping with a narrow no-break space → "2 400".
function groupFr(v: number) {
  return Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

// Split "2 400+" → { prefix:"", target:2400, suffix:"+" } (keeps %, +, etc.).
function parseStat(value: string) {
  const m = value.match(/^(\D*?)([\d\s.,  ]*\d)(\D*)$/)
  if (!m) return { prefix: "", target: 0, suffix: value }
  return { prefix: m[1], target: parseInt(m[2].replace(/\D/g, ""), 10) || 0, suffix: m[3] }
}

// A single stat number that counts up from 0 when it scrolls into view.
function StatNumber({ value }: { value: string }) {
  const { prefix, target, suffix } = parseStat(value)
  const reduce = useReducedMotion()
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const count = useMotionValue(reduce ? target : 0)
  const text = useTransform(count, (v) => `${prefix}${groupFr(v)}${suffix}`)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(count, target, { duration: 1.8, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [inView, reduce, target, count])

  return (
    <motion.p
      ref={ref}
      className="font-display text-[clamp(3rem,6.5vw,5.25rem)] font-semibold leading-none tracking-[-0.03em] text-foreground tabular-nums"
    >
      {text}
    </motion.p>
  )
}

// Hairline that draws itself left→right when it enters — like the menu frame.
function DrawLine() {
  return (
    <motion.div
      className="h-px w-full origin-left bg-border"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.9 }}
      transition={{ duration: 1, ease: EASE }}
    />
  )
}

// Partners strip scrolling right → left, looping seamlessly.
function PartnersMarquee() {
  const reduce = useReducedMotion()
  const loop = [...partners, ...partners] // duplicated for a seamless -50% loop

  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
      <motion.div
        className="flex w-max"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={reduce ? undefined : { duration: 34, ease: "linear", repeat: Infinity }}
      >
        {loop.map((p, i) => (
          <span key={i} className="flex items-center whitespace-nowrap">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-foreground-muted md:text-sm">
              {p}
            </span>
            <span className="mx-10 size-1 rounded-full bg-foreground/25 md:mx-14" aria-hidden />
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export function StatsBar() {
  return (
    <section
      data-header-theme="light"
      className="bg-background py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Drawing line — delimits the section, like the menu bar */}
        <DrawLine />

        {/* Stats — centered, counting up on scroll */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-16 py-20 text-center md:py-28 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <StatNumber value={stat.value} />
              <p className="mt-4 max-w-[16ch] text-sm leading-relaxed text-foreground-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Drawing line + partners marquee */}
        <DrawLine />
        <div className="pt-12 md:pt-16">
          <p className="mb-8 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-foreground-muted/80">
            Ils nous font confiance
          </p>
          <PartnersMarquee />
        </div>
      </div>
    </section>
  )
}
