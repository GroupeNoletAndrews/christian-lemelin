"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"

// Scramble-reveal effect (ui-layouts "text-randomized" pattern) re-themed for
// ECL: the title "settles out" of the chemical symbols of the metals the shop
// works — the text resolves left → right while the unresolved slots flicker
// through periodic-table metal symbols. All work happens in a timer (never in
// render) so there's no hydration mismatch; reduced-motion shows the final text
// immediately. See DESIGN.md.

// Periodic-table symbols of the metals ECL fabricates (+ a few common alloying
// metals) — the visual "alphabet" of the scramble.
const METAL_SYMBOLS = [
  "Fe", "Al", "Cu", "Ti", "Zn", "Ni", "Cr", "Sn", "Pb", "Au", "Ag",
  "Mg", "Mn", "Co", "Mo", "Zr", "Nb", "Pt", "Pd", "Li", "Ta", "W", "V",
]
// Flattened to single glyphs so each slot stays ~one character wide — the huge
// hero title must not reflow horizontally while it resolves.
const POOL = Array.from(new Set(METAL_SYMBOLS.join("").split("")))

function randGlyph() {
  return POOL[Math.floor(Math.random() * POOL.length)]
}

export function RandomizedTextEffect({
  text,
  start = true,
  // ms between frames; lower = faster flicker.
  speed = 35,
  // characters revealed per frame; higher = the text locks in sooner.
  revealRate = 1 / 2,
  className,
}: {
  text: string
  start?: boolean
  speed?: number
  revealRate?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState("")

  useEffect(() => {
    // Static cases (no animation) are handled at render — the effect only runs
    // the scramble timer, and only ever calls setState from inside the timer.
    if (reduce || !start) return
    const chars = text.split("")
    let revealed = 0
    const id = setInterval(() => {
      revealed += revealRate
      setDisplay(
        chars
          .map((c, i) => (c === " " ? " " : i < revealed ? c : randGlyph()))
          .join(""),
      )
      if (revealed >= chars.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, start, reduce, speed, revealRate])

  const shown = reduce ? text : start ? display : ""

  return (
    <span className={className}>
      {/* Real text for a11y / SEO; the flicker is decorative. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden>{shown}</span>
    </span>
  )
}
