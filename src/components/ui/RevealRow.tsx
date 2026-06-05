"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"

// A hairline-topped row whose top divider DRAWS (scaleX) and whose content
// FADES UP, staggered, when it scrolls into view. No card — just a rule + the
// content. Used by ReasonsReveal and other editorial lists. See DESIGN.md §7.
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]
const EASE_MENU: [number, number, number, number] = [0.76, 0, 0.24, 1]

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, when: "beforeChildren" } },
}
const lineV: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.7, ease: EASE_MENU } },
}
const contentV: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
}

export function RevealRow({
  children,
  className = "",
  amount = 0.4,
}: {
  children: ReactNode
  className?: string
  amount?: number
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={container}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "visible"}
      viewport={{ once: true, amount }}
    >
      <motion.div
        aria-hidden
        className="h-px w-full origin-left bg-border"
        variants={reduce ? undefined : lineV}
      />
      <motion.div variants={reduce ? undefined : contentV}>{children}</motion.div>
    </motion.div>
  )
}
