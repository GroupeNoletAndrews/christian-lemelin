"use client"

import { motion, useReducedMotion } from "motion/react"

// Hairline that draws itself when it scrolls into view — same easing as the
// menu frame (Header.tsx) and the StatsBar dividers. Promoted from the inline
// StatsBar version so every section (SolutionsIndex, ReasonsReveal, the
// réalisations label rule…) shares one idiom. See DESIGN.md §7.
const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

export function DrawLine({
  vertical = false,
  delay = 0,
  duration = 1,
  once = true,
  className = "",
}: {
  vertical?: boolean
  delay?: number
  duration?: number
  once?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  const base = vertical ? "h-full w-px origin-top" : "h-px w-full origin-left"
  const hidden = vertical ? { scaleY: 0 } : { scaleX: 0 }
  const shown = vertical ? { scaleY: 1 } : { scaleX: 1 }

  return (
    <motion.div
      aria-hidden
      className={`bg-border ${base} ${className}`}
      initial={reduce ? false : hidden}
      whileInView={reduce ? undefined : shown}
      viewport={{ once, amount: 0.9 }}
      transition={{ duration, ease: EASE, delay }}
    />
  )
}
