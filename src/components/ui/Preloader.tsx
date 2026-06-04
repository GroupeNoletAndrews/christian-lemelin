"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useLenis } from "@/components/providers/LenisProvider"

// Onboarding preloader — identical behaviour to skiper-ui "Skiper8" (curved
// path reveal + cycling words), but presenting the company. See DESIGN.md §9.
// Plays once per full page load (layout persists across client navigations).

// Words presenting the company. Easy to edit.
const words = [
  "Inox",
  "Acier",
  "Aluminium",
  "Laiton",
  "Cuivre",
  "Sur mesure",
  "Christian Lemelin",
]

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

const slideUp = {
  initial: { top: 0 },
  exit: { top: "-100vh", transition: { duration: 0.8, ease: EASE, delay: 0.2 } },
}

const opacity = {
  initial: { opacity: 0 },
  enter: { opacity: 0.85, transition: { duration: 0.8, delay: 0.2 } },
}

export function Preloader() {
  const lenis = useLenis()
  const [isLoading, setIsLoading] = useState(true)
  const [index, setIndex] = useState(0)
  // Start at 0 on both server and client (no hydration mismatch); real
  // dimensions are set after mount, then the curve + word render.
  const [dim, setDim] = useState<{ w: number; h: number }>({ w: 0, h: 0 })

  useEffect(() => {
    setDim({ w: window.innerWidth, h: window.innerHeight })
  }, [])

  // Lock scroll while the intro plays (Lenis + native fallback)
  useEffect(() => {
    if (isLoading) {
      lenis?.stop()
      document.body.style.overflow = "hidden"
    } else {
      lenis?.start()
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isLoading, lenis])

  // Cycle through the words, then dismiss
  useEffect(() => {
    if (!isLoading) return
    if (index === words.length - 1) {
      const t = setTimeout(() => setIsLoading(false), 800)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setIndex(index + 1), index === 0 ? 900 : 160)
    return () => clearTimeout(t)
  }, [index, isLoading])

  const initialPath = `M0 0 L${dim.w} 0 L${dim.w} ${dim.h} Q${dim.w / 2} ${dim.h + 300} 0 ${dim.h} L0 0`
  const targetPath = `M0 0 L${dim.w} 0 L${dim.w} ${dim.h} Q${dim.w / 2} ${dim.h} 0 ${dim.h} L0 0`

  const curve = {
    initial: { d: initialPath, transition: { duration: 0.7, ease: EASE } },
    exit: { d: targetPath, transition: { duration: 0.7, ease: EASE, delay: 0.3 } },
  }

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          variants={slideUp}
          initial="initial"
          exit="exit"
          className="fixed left-0 z-[100] flex h-screen w-full items-center justify-center bg-ink"
        >
          {dim.w > 0 && (
            <>
              <motion.p
                variants={opacity}
                initial="initial"
                animate="enter"
                className="relative z-10 flex items-center font-display text-[clamp(2rem,6vw,4rem)] font-medium text-white"
              >
                <span className="mr-4 inline-block h-2.5 w-2.5 rounded-full bg-accent md:h-3 md:w-3" />
                {words[index]}
              </motion.p>
              <svg
                className="absolute top-0 h-[calc(100%+300px)] w-full"
                style={{ fill: "#111111" }}
              >
                <motion.path variants={curve} initial="initial" exit="exit" />
              </svg>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
