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
import { ArrowsOutSimple, PencilSimple } from "@phosphor-icons/react"
import { Realisation } from "@/types/admin"
import { imgSrc, isUnoptimizedSrc } from "@/lib/media"
import { useLocale } from "@/components/providers/LocaleProvider"
import { t } from "@/lib/i18n"

// Alternating aspect ratios give the masonry layout its rhythm. The portrait
// tile was 4/5, which `object-cover` cropped a 3:2 landscape photo down to 53%
// of its width — that reads as "zoomed and soft" however sharp the source is.
// Square keeps 67% and needs a smaller source to stay crisp (see CROP_FACTOR).
const RATIOS = ["aspect-[4/3]", "aspect-[1/1]", "aspect-[1/1]", "aspect-[4/3]"]

// How much wider than the frame the source must be. The image box is W × 1.15H
// (the parallax oversize below), so with `object-cover` a source wider than the
// box matches on HEIGHT and overflows horizontally: F = 1.15 × A_src / R (R =
// frame width/height), using a 3:2 source as the common case. Folded into
// `sizes` so the browser fetches a candidate that is actually big enough —
// this, not the oversize, is why half the tiles looked soft.
const CROP_FACTOR: Record<string, number> = {
  "aspect-[1/1]": 1.73,
  "aspect-[4/3]": 1.3,
}

/** Which grid the card sits in — each divides the 1400px container differently. */
export type CardLayout = "grid" | "carousel"

// Container is `mx-auto max-w-[1400px] px-6 md:px-12`, so its content width is
// `vw - 48` below md, `vw - 96` above, and a fixed 1304px past 1400px. `f` is
// the crop factor above: the browser must fetch that much more than the frame
// width or `object-cover` upscales what it keeps.
function sizesFor(layout: CardLayout, f: number): string {
  const px = (n: number) => `${Math.round(n * f)}px`
  const scale = (expr: string) => (f === 1 ? `calc(${expr})` : `calc((${expr}) * ${f})`)
  if (layout === "carousel") {
    return `(min-width: 1400px) ${px(405)}, (min-width: 1024px) ${scale("(100vw - 96px) * 0.31")}, (min-width: 640px) ${scale("min(46vw, 440px)")}, ${scale("min(80vw, 440px)")}`
  }
  return `(min-width: 1400px) ${px(419)}, (min-width: 1024px) ${scale("(100vw - 144px) / 3")}, (min-width: 768px) ${scale("(100vw - 120px) / 2")}, (min-width: 640px) ${scale("(100vw - 72px) / 2")}, ${scale("100vw - 48px")}`
}

// Parallax travel as a % of the (oversized) image height — the "images lag
// behind the scroll" feel from DESIGN.md §7. Kept small so the image is only
// mildly oversized (see h-[115%] below): more travel needs more oversize, which
// reads as the photo being "zoomed in". Must stay ≤ the per-side margin
// (PARALLAX_AMOUNT × 1.15 ≤ 7.5) or the frame edge shows through at scroll ends.
const PARALLAX_AMOUNT = 5

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
  onEdit,
  noMargin = false,
  layout = "grid",
  priority = false,
}: {
  realisation: Realisation
  index?: number
  ratio?: string
  /** If set, the card links here (e.g. /realisations?featured=id). */
  href?: string
  /** If set, clicking the card calls this (e.g. open the lightbox). */
  onSelect?: () => void
  /** Content-workspace preview only: shows a pencil to edit this réalisation. */
  onEdit?: () => void
  /** Drop the masonry bottom-margin (for grid / carousel layouts). */
  noMargin?: boolean
  /** Which grid this card sits in — drives the `sizes` arithmetic. */
  layout?: CardLayout
  /** Above-the-fold card (the first tile of /realisations): eager + high
   *  fetch priority, since it is the page's LCP. */
  priority?: boolean
}) {
  const locale = useLocale()
  const cardRatio = ratio ?? RATIOS[index % RATIOS.length]
  const scaledSizes = sizesFor(layout, CROP_FACTOR[cardRatio] ?? 1.3)
  const images = realisation.images.length ? realisation.images : [""]
  const [active, setActive] = useState(0)
  // Photos beyond the first only mount once the pointer enters: `opacity-0` is
  // not `display:none`, so mounting them all made a 9-card grid fetch every
  // photo of every project and starve the visible ones.
  const [primed, setPrimed] = useState(false)
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
    setPrimed(true)
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
      className={`group relative break-inside-avoid ${noMargin ? "" : "mb-6"}`}
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
            {/* Oversized, parallax-translating image stack (carousel). The
                scale on hover is what makes a tile feel clickable now that it
                opens a viewer rather than navigating. */}
            <motion.div
              style={{ y: reduce ? 0 : y }}
              className="absolute inset-x-0 -top-[7.5%] h-[115%] transition-transform duration-700 ease-out will-change-transform motion-safe:group-hover:scale-[1.04]"
            >
              {images.map((src, i) => {
                if (!src) return null
                if (i > 0 && !primed) return null
                const url = imgSrc(src, realisation.updatedAt.getTime())
                return (
                  <Image
                    key={i}
                    src={url}
                    alt={realisation.name}
                    fill
                    quality={90}
                    priority={priority && i === 0}
                    unoptimized={isUnoptimizedSrc(url)}
                    sizes={scaledSizes}
                    className={`object-cover transition-opacity duration-500 ${
                      i === active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                )
              })}
            </motion.div>

            {/* Hover cue — says "this opens" without adding a link. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute right-3 top-3 z-10 grid size-9 translate-y-1 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <ArrowsOutSimple size={16} weight="bold" />
            </span>

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

      {/* In-place edit affordance — sibling of the link wrapper (not nested) so
          it never triggers navigation; only rendered in the workspace preview. */}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label={t("Modifier cette réalisation", "Edit this project", locale)}
          className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-accent p-2 text-white shadow-lg transition-colors hover:bg-accent-hover"
        >
          <PencilSimple size={16} weight="bold" />
        </button>
      )}

      <div className="mt-4">
        {/* Neutral hover cue only — DESIGN.md §2 forbids blue text; the accent
            is reserved for the ↗ arrow and button fills. */}
        <h3 className="font-display text-xl font-medium leading-tight text-foreground transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1">
          {realisation.name}
        </h3>
      </div>
    </motion.article>
  )
}
