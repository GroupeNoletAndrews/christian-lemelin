"use client"

import { useEffect, useRef } from "react"
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import { APROPOS_STATS } from "@/content"
import { useLocale } from "@/components/providers/LocaleProvider"
import { tr } from "@/lib/i18n"

// « Nos performances en chiffres » — même traitement count-up que StatsBar
// (accueil), mais métriques propres à /a-propos. N'anime que le texte du nombre
// (aucun changement de layout) → conforme à la consigne « pas d'animation saccadée ».

function groupFr(v: number) {
  return Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

function parseStat(value: string) {
  const m = value.match(/^(\D*?)([\d\s.,  ]*\d)(\D*)$/)
  if (!m) return { prefix: "", target: 0, suffix: value }
  return { prefix: m[1], target: parseInt(m[2].replace(/\D/g, ""), 10) || 0, suffix: m[3] }
}

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
      className="font-display text-[clamp(2.25rem,4.6vw,3.5rem)] font-semibold leading-none tracking-[-0.03em] text-foreground tabular-nums"
    >
      {text}
    </motion.p>
  )
}

export function AProposStats() {
  const locale = useLocale()
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-3">
      {APROPOS_STATS.map((s) => (
        <div key={s.value} className="border-t border-border pt-6">
          <StatNumber value={s.value} />
          <p className="mt-4 max-w-[24ch] text-sm leading-relaxed text-foreground-muted">{tr(s.label, locale)}</p>
        </div>
      ))}
    </div>
  )
}
