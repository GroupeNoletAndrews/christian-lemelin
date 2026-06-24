"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react"
import { Realisation } from "@/types/admin"

// Alternating aspect ratios give the masonry layout its rhythm.
const RATIOS = ["aspect-[4/3]", "aspect-[4/5]", "aspect-[4/5]", "aspect-[4/3]"]

// Parallax travel as a % of the (oversized) image height — the "images lag
// behind the scroll" feel from DESIGN.md §7.
const PARALLAX_AMOUNT = 18

/**
 * A réalisation tile with a hover image carousel and a scroll parallax (the
 * image is oversized and translates slower than the page, so tiles appear to
 * lag behind the scroll). Sized for a masonry (CSS columns) layout — the
 * aspect ratio alternates by index. Used on the home section and /realisations.
 */
export function RealisationCard({
  realisation,
  index = 0,
  ratio,
  href,
  onSelect,
}: {
  realisation: Realisation
  index?: number
  ratio?: string
  /** If set, the card links here (e.g. /realisations?featured=id). */
  href?: string
  /** If set, clicking the card calls this (e.g. feature it in place). */
  onSelect?: () => void
}) {
  const cardRatio = ratio ?? RATIOS[index % RATIOS.length]
  const images = realisation.images.length ? realisation.images : [""]
  const [active, setActive] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  // Scroll parallax
  const frameRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  })
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${PARALLAX_AMOUNT}%`, `${PARALLAX_AMOUNT}%`]
  )

  const stop = () => {
    if (timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
  }

  const start = () => {
    if (images.length <= 1) return
    stop()
    timer.current = setInterval(() => {
      setActive((i) => (i + 1) % images.length)
    }, 1800)
  }

  const reset = () => {
    stop()
    setActive(0)
  }

  // Clean up on unmount
  useEffect(() => stop, [])

  return (
    <motion.article
      className="group mb-6 break-inside-avoid"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.06 }}
      onMouseEnter={start}
      onMouseLeave={reset}
    >
      {(() => {
        const frame = (
          <div
            ref={frameRef}
            className={`relative ${cardRatio} overflow-hidden rounded-2xl border border-border bg-surface-elevated`}
          >
            {/* Oversized, parallax-translating image stack (carousel) */}
            <motion.div
              style={{ y: reduce ? 0 : y }}
              className="absolute inset-x-0 -top-[35%] h-[170%] will-change-transform"
            >
              {images.map((src, i) =>
                src ? (
                  <Image
                    key={i}
                    src={src}
                    alt={realisation.name}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={`object-cover transition-opacity duration-500 ${
                      i === active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ) : null
              )}
            </motion.div>

            {/* Carousel indicator (fixed on the frame, not parallaxed) */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === active ? "w-4 bg-white" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )
        if (href) {
          return (
            <Link href={href} aria-label={realisation.name} className="block cursor-pointer">
              {frame}
            </Link>
          )
        }
        if (onSelect) {
          return (
            <button
              type="button"
              onClick={onSelect}
              aria-label={realisation.name}
              className="block w-full cursor-pointer text-left"
            >
              {frame}
            </button>
          )
        }
        return frame
      })()}

      <div className="mt-4">
        <h3 className="font-display text-xl font-medium leading-tight text-foreground">
          {realisation.name}
        </h3>
      </div>
    </motion.article>
  )
}
