"use client"

import { useEffect, useState } from "react"
import { useLenis } from "@/components/providers/LenisProvider"

// Fully custom thin scrollbar (Firefox look) — renders identically in every
// browser since it's our own DOM, not the native scrollbar. Driven by Lenis
// (falls back to window scroll). Thin by default, thicker on hover.
// See DESIGN.md §9.
export function CustomScrollbar() {
  const lenis = useLenis()
  const [m, setM] = useState({ thumbH: 0, thumbTop: 0, show: false })

  useEffect(() => {
    const compute = () => {
      const winH = window.innerHeight
      const docH = document.documentElement.scrollHeight
      const limit = docH - winH
      const scroll = lenis ? lenis.scroll : window.scrollY
      if (limit <= 1) {
        setM((p) => (p.show ? { ...p, show: false } : p))
        return
      }
      const thumbH = Math.max((winH / docH) * winH, 36)
      const thumbTop = (Math.min(Math.max(scroll, 0), limit) / limit) * (winH - thumbH)
      setM({ thumbH, thumbTop, show: true })
    }

    const onScroll = () => compute()
    if (lenis) lenis.on("scroll", onScroll)
    else window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", compute)
    const ro = new ResizeObserver(compute)
    ro.observe(document.body)
    compute()

    return () => {
      if (lenis) lenis.off("scroll", onScroll)
      else window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", compute)
      ro.disconnect()
    }
  }, [lenis])

  if (!m.show) return null

  return (
    <div
      className="group fixed right-0 top-0 z-[90] hidden h-screen w-3 md:block"
      aria-hidden="true"
    >
      <div
        className="absolute right-[3px] w-[3px] rounded-full bg-[rgba(130,130,130,0.5)] transition-[width,right,background-color] duration-200 group-hover:right-[2px] group-hover:w-[7px] group-hover:bg-[rgba(110,110,110,0.85)]"
        style={{
          height: `${m.thumbH}px`,
          transform: `translateY(${m.thumbTop}px)`,
          willChange: "transform",
        }}
      />
    </div>
  )
}
