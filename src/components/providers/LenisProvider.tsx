"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Smooth-scroll provider (Lenis), synced with GSAP ScrollTrigger so pinned /
// scrubbed animations and motion `useScroll` parallax stay buttery. See DESIGN.md §9.
const LenisContext = createContext<Lenis | null>(null)

export const useLenis = () => useContext(LenisContext)

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    const instance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })
    setLenis(instance)

    // Drive Lenis from GSAP's ticker (single rAF loop) + keep ScrollTrigger in sync
    instance.on("scroll", ScrollTrigger.update)
    const raf = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
