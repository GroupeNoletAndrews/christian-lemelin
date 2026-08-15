"use client"

import { useRef, type CSSProperties } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react"

// Parallax image (OPUS-style "image grows on scroll") — see DESIGN.md §7.
// The image is only mildly oversized (115% of frame, 7.5% bleed top & bottom)
// and translates vertically as the frame scrolls through the viewport. Place
// inside a `relative overflow-hidden` element that defines the aspect ratio /
// rounded corners. `amount` = how far the image travels, as a % of its own
// (oversized) height. Keep `amount × 1.15 ≤ 7.5` (i.e. ≤ ~6) or the translation
// reveals the frame edge at scroll ends; more travel would need more oversize,
// which reads as the photo being "zoomed in" (the look we're avoiding).
export function ParallaxImage({
  src,
  alt,
  sizes,
  amount = 5,
  unoptimized = false,
  objectPosition,
  scale,
  grayscale = false,
  frameStyle,
  priority = false,
  quality = 90,
}: {
  src: string
  alt: string
  sizes?: string
  amount?: number
  /** Pass for non-whitelisted sources (e.g. admin-uploaded data: URLs). */
  unoptimized?: boolean
  /** Focal point (CSS object-position), e.g. "50% 30%". */
  objectPosition?: string
  /** Extra zoom on top of the parallax oversize (1 = none). */
  scale?: number
  grayscale?: boolean
  /** Border-radius / border applied to the clipping frame. */
  frameStyle?: CSSProperties
  priority?: boolean
  /** 90 by default — 75 (next/image's default) visibly softens metal texture.
   *  Allowed values come from `images.qualities` in next.config.ts. */
  quality?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`])

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" style={frameStyle}>
      <motion.div
        style={{ y: reduce ? 0 : y, scale: scale && scale !== 1 ? scale : undefined }}
        className="absolute inset-x-0 -top-[7.5%] h-[115%] will-change-transform"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          unoptimized={unoptimized}
          className={`object-cover${grayscale ? " grayscale" : ""}`}
          style={objectPosition ? { objectPosition } : undefined}
        />
      </motion.div>
    </div>
  )
}
