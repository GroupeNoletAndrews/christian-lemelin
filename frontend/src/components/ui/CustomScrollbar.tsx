"use client"

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { useLenis } from "@/components/providers/LenisProvider"

// Fully custom thin scrollbar (Firefox look) — renders identically in every
// browser since it's our own DOM, not the native scrollbar. Driven by Lenis
// (falls back to window scroll). Thin by default, thicker on hover.
//
// Interactive: the thumb is **draggable** and the track is **click-to-jump**,
// so it behaves like a real scrollbar (the native one is hidden via globals.css).
// See DESIGN.md §9.
export function CustomScrollbar() {
  const lenis = useLenis()
  const [m, setM] = useState({ thumbH: 0, thumbTop: 0, show: false })
  // Offset between the cursor and the thumb's top at grab time (null = not dragging).
  const grabOffset = useRef<number | null>(null)
  // The bar is `hidden md:block` — but the metrics below still ran on phones,
  // reading `scrollHeight` (a forced layout) and re-rendering on every single
  // scroll event to move a thumb nobody can see. Gate the whole thing on the
  // same breakpoint the CSS uses so touch scrolling pays nothing for it.
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const sync = () => setEnabled(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  // Live metrics — read on demand so drag/click math always uses fresh values.
  const metrics = () => {
    const winH = window.innerHeight
    const docH = document.documentElement.scrollHeight
    const limit = Math.max(docH - winH, 0)
    const thumbH = Math.max((winH / docH) * winH, 36)
    return { winH, limit, thumbH }
  }

  useEffect(() => {
    if (!enabled) return
    let frame = 0
    const compute = () => {
      frame = 0
      const { winH, limit, thumbH } = metrics()
      const scroll = lenis ? lenis.scroll : window.scrollY
      if (limit <= 1) {
        setM((p) => (p.show ? { ...p, show: false } : p))
        return
      }
      const thumbTop = (Math.min(Math.max(scroll, 0), limit) / limit) * (winH - thumbH)
      // Same object when nothing moved → React skips the re-render entirely.
      setM((p) =>
        p.show && p.thumbH === thumbH && p.thumbTop === thumbTop
          ? p
          : { thumbH, thumbTop, show: true },
      )
    }
    // One layout read + at most one render per painted frame, not per event.
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(compute)
    }

    if (lenis) lenis.on("scroll", schedule)
    else window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    const ro = new ResizeObserver(schedule)
    ro.observe(document.body)
    compute()

    return () => {
      if (frame) cancelAnimationFrame(frame)
      if (lenis) lenis.off("scroll", schedule)
      else window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      ro.disconnect()
    }
  }, [lenis, enabled])

  // Scroll the page to an absolute Y (immediate while dragging so the thumb
  // tracks the cursor 1:1; the scroll event then re-syncs the thumb position).
  const scrollToY = (y: number) => {
    const { limit } = metrics()
    const target = Math.min(Math.max(y, 0), limit)
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true })
    else window.scrollTo(0, target)
  }

  // Map a desired thumb-top (px from viewport top) back to a scroll offset.
  const thumbTopToScroll = (thumbTop: number) => {
    const { winH, limit, thumbH } = metrics()
    const denom = winH - thumbH
    return denom > 0 ? (thumbTop / denom) * limit : 0
  }

  const onThumbPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation() // don't let the track treat this as a jump-click
    grabOffset.current = e.clientY - m.thumbTop
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onThumbPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (grabOffset.current == null) return
    const { winH, thumbH } = metrics()
    const desired = Math.min(Math.max(e.clientY - grabOffset.current, 0), winH - thumbH)
    scrollToY(thumbTopToScroll(desired))
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (grabOffset.current == null) return
    grabOffset.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* pointer already released */
    }
  }

  // Click anywhere on the track → center the thumb on the click point.
  const onTrackPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const { winH, thumbH } = metrics()
    const desired = Math.min(Math.max(e.clientY - thumbH / 2, 0), winH - thumbH)
    scrollToY(thumbTopToScroll(desired))
  }

  if (!enabled || !m.show) return null

  return (
    <div
      className="group fixed right-0 top-0 z-[90] hidden h-screen w-3 cursor-pointer touch-none select-none md:block"
      aria-hidden="true"
      onPointerDown={onTrackPointerDown}
    >
      <div
        onPointerDown={onThumbPointerDown}
        onPointerMove={onThumbPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="absolute right-[3px] w-[3px] cursor-grab rounded-full bg-[rgba(130,130,130,0.5)] transition-[width,right,background-color] duration-200 group-hover:right-[2px] group-hover:w-[7px] group-hover:bg-[rgba(110,110,110,0.85)] active:cursor-grabbing"
        style={{
          height: `${m.thumbH}px`,
          transform: `translateY(${m.thumbTop}px)`,
          willChange: "transform",
        }}
      />
    </div>
  )
}
