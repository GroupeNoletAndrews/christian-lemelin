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

  // Content-workspace preview: the admin posts `preview-scroll` with a section
  // anchor so the iframe lands ON that section (e.g. Savoir-faire sits far down
  // the home page). Jump instantly (no smooth animation) and re-run once after
  // layout settles, since lazy images/fonts shift the section's offset.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.source !== "cl-content-admin" || e.data?.type !== "preview-scroll") return
      const anchor = e.data.anchor as string | undefined
      if (!anchor) return
      const scroll = () => {
        const el = document.getElementById(anchor)
        if (!el) return
        if (lenis) lenis.scrollTo(el, { immediate: true, force: true, offset: -80 })
        else el.scrollIntoView()
      }
      scroll()
      window.setTimeout(scroll, 400)
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [lenis])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
