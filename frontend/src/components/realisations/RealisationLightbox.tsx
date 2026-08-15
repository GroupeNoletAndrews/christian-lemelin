"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react"
import type { Realisation } from "@/types/admin"
import { imgSrc, isUnoptimizedSrc } from "@/lib/media"
import { useLenis } from "@/components/providers/LenisProvider"
import { lockScroll, relockScroll, unlockScroll } from "@/lib/scroll-lock"
import { useLocale } from "@/components/providers/LocaleProvider"
import { t } from "@/lib/i18n"

// Full-screen project viewer opened by clicking a réalisation card (home grid or
// /realisations collection). Deliberately NOT built on `linear-modal`: that
// primitive owns its open state through a trigger, whereas this viewer is
// controlled from outside (a card click, or the ?featured=<id> deep link) and
// needs its own carousel with keyboard + swipe navigation. It reuses the same
// proven mechanics though — portal, Lenis + body scroll-lock, Escape, focus
// restore.
//
// The photo is rendered `object-contain` (never cropped — the whole project is
// the point) at `sizes="100vw"` and quality 90. The grid cards deliberately
// request small variants, so this is what makes a clicked project actually
// sharp.

export function RealisationLightbox({
  realisation,
  startIndex = 0,
  onClose,
}: {
  /** Project to show; null closes the viewer. */
  realisation: Realisation | null
  /** Photo to open on (defaults to the cover). */
  startIndex?: number
  onClose: () => void
}) {
  const lenis = useLenis()
  const open = !!realisation

  // The scroll lock lives HERE, not in Viewer: switching projects mounts a new
  // Viewer while AnimatePresence is still unmounting the old one, and the old
  // one's cleanup would release the lock the new one just took (page scrolls
  // behind an open overlay). Keyed on "is anything open" instead.
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    lockScroll()
    // A ?featured=<id> deep link can open this DURING the Preloader intro, and
    // the Preloader clears body{overflow} when it finishes — which would unlock
    // the page under an open overlay. Re-assert the lock on its done event.
    const relock = () => {
      relockScroll()
      lenis?.stop()
    }
    window.addEventListener("eclemelin:preloader-done", relock)
    return () => {
      window.removeEventListener("eclemelin:preloader-done", relock)
      lenis?.start()
      unlockScroll()
    }
  }, [open, lenis])

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {realisation && (
        // Keyed by project: switching projects remounts, which resets the photo
        // index without an effect.
        <Viewer
          key={realisation.id}
          realisation={realisation}
          startIndex={startIndex}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    document.body,
  )
}

function Viewer({
  realisation,
  startIndex,
  onClose,
}: {
  realisation: Realisation
  startIndex: number
  onClose: () => void
}) {
  const locale = useLocale()
  const reduce = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)

  const images = realisation.images.filter(Boolean)
  const count = images.length
  const [index, setIndex] = useState(Math.min(Math.max(startIndex, 0), Math.max(count - 1, 0)))
  // Direction of the last navigation, so the slide matches the intent.
  const [dir, setDir] = useState(0)

  const go = useCallback(
    (step: 1 | -1) => {
      if (count <= 1) return
      setDir(step)
      setIndex((i) => (i + step + count) % count)
    },
    [count],
  )

  const jump = (to: number) => {
    setDir(to > index ? 1 : -1)
    setIndex(to)
  }

  // Keyboard: Escape closes, arrows navigate, Home/End jump to the ends, and
  // Tab cycles INSIDE the overlay (without the trap, tabbing walks into the
  // page behind it, which is still there — just covered).
  // No dep array on purpose: the handler closes over `index`, and re-binding a
  // single listener per render is cheaper than the bookkeeping to avoid it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (!nodes?.length) return
        const list = Array.from(nodes)
        const first = list[0]
        const last = list[list.length - 1]
        const activeEl = document.activeElement as HTMLElement | null
        // Membership in the trap's own list, NOT DOM containment: on open the
        // focus sits on the panel itself, and `panel.contains(panel)` is true —
        // so a containment test let the very first Shift+Tab walk out into the
        // page behind the overlay.
        const inTrap = !!activeEl && list.includes(activeEl)
        if (e.shiftKey && (!inTrap || activeEl === first)) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && (!inTrap || activeEl === last)) {
          e.preventDefault()
          first.focus()
        }
        return
      }
      if (!["Escape", "ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return
      // Otherwise the arrows scroll the (locked-but-present) page behind.
      e.preventDefault()
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowRight") go(1)
      else if (e.key === "ArrowLeft") go(-1)
      else if (e.key === "Home") jump(0)
      else if (e.key === "End") jump(count - 1)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  })

  // Focus into the panel, restored to the tile that opened it. (The scroll lock
  // is owned by the host component — see the note there.)
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => prevFocus?.focus?.()
  }, [])

  // Horizontal swipe. We do NOT set touch-action: pan-x — that strips vertical
  // panning from every touch starting inside (the lesson already learned in
  // Materiaux / RealisationsGrid). We just measure the gesture and require it
  // to be clearly horizontal before treating it as navigation.
  const touch = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    const p = e.touches[0]
    touch.current = { x: p.clientX, y: p.clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current
    touch.current = null
    if (!start) return
    const p = e.changedTouches[0]
    const dx = p.clientX - start.x
    const dy = p.clientY - start.y
    if (Math.abs(dx) < 44 || Math.abs(dx) <= Math.abs(dy)) return
    go(dx < 0 ? 1 : -1)
  }

  const version = new Date(realisation.updatedAt).getTime()
  const url = count > 0 ? imgSrc(images[index], version) : ""
  // Neighbours are mounted at opacity-0 (which, unlike display:none, still
  // fetches) so moving to the next photo is instant.
  const neighbours =
    count > 1
      ? Array.from(
          new Set([
            imgSrc(images[(index + 1) % count], version),
            imgSrc(images[(index - 1 + count) % count], version),
          ]),
        ).filter((n) => n !== url)
      : []

  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: dir === 0 ? 0 : dir > 0 ? 48 : -48 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: dir > 0 ? -48 : 48 },
      }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col bg-ink/[0.98] backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={realisation.name}
        tabIndex={-1}
        data-lenis-prevent
        className="flex h-full w-full flex-col outline-none"
      >
        {/* Header — project name + close */}
        <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-3 pt-5 md:px-10 md:pt-8">
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl font-semibold leading-tight text-white md:text-3xl">
              {realisation.name}
            </h2>
            {count > 1 && (
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                {index + 1} / {count}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Fermer", "Close", locale)}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-white/80 backdrop-blur-md transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Stage — the photo, uncropped, plus the side arrows */}
        <div
          className="relative min-h-0 flex-1 px-3 pb-3 md:px-10 md:pb-6"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative h-full w-full overflow-hidden rounded-2xl">
            {url ? (
              <>
                <AnimatePresence initial={false} mode="sync">
                  <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={slide.initial}
                    animate={slide.animate}
                    exit={slide.exit}
                    transition={{ duration: reduce ? 0.2 : 0.32, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Image
                      src={url}
                      alt={realisation.name}
                      fill
                      priority
                      quality={90}
                      unoptimized={isUnoptimizedSrc(url)}
                      sizes="100vw"
                      className="object-contain"
                    />
                  </motion.div>
                </AnimatePresence>

                {neighbours.map((n) => (
                  <Image
                    key={n}
                    src={n}
                    alt=""
                    aria-hidden
                    fill
                    quality={90}
                    unoptimized={isUnoptimizedSrc(n)}
                    sizes="100vw"
                    className="pointer-events-none object-contain opacity-0"
                  />
                ))}
              </>
            ) : (
              // A project with no photo yet: say so rather than opening an empty
              // overlay (which would read as "clicking does nothing" again).
              <div className="grid h-full w-full place-items-center">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/50">
                  {t("Aucune photo pour ce projet.", "No photos for this project yet.", locale)}
                </p>
              </div>
            )}
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={t("Photo précédente", "Previous photo", locale)}
                className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white/80 backdrop-blur-md transition-colors hover:border-white/40 hover:bg-black/70 hover:text-white md:left-12 md:size-12"
              >
                <CaretLeft size={20} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={t("Photo suivante", "Next photo", locale)}
                className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white/80 backdrop-blur-md transition-colors hover:border-white/40 hover:bg-black/70 hover:text-white md:right-12 md:size-12"
              >
                <CaretRight size={20} weight="bold" />
              </button>
            </>
          )}
        </div>

        {/* Footer — photo dots */}
        {count > 1 && (
          <div className="flex shrink-0 items-center justify-center gap-2 px-6 pb-6 pt-1">
            {/* The visible bar stays thin, but the button itself is padded to a
                real touch target (the bare 6px bar was unhittable on a phone). */}
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => jump(i)}
                aria-label={t(`Photo ${i + 1} sur ${count}`, `Photo ${i + 1} of ${count}`, locale)}
                aria-current={i === index}
                className="group grid h-11 place-items-center px-1"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 group-hover:bg-white/70"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
