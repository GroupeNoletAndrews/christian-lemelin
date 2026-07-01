"use client"

import { useRef, type CSSProperties } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react"

// Parallax image (OPUS-style "image grows on scroll") — see DESIGN.md §7.
// The image is oversized (140% of frame) and translates vertically as the
// frame scrolls through the viewport. Place inside a `relative overflow-hidden`
// element that defines the aspect ratio / rounded corners.
// `amount` = how far the image travels, as a % of its own (oversized) height.
// The image is 170% tall (35% bleed top & bottom) so it never reveals an edge
// even at the stronger amplitude. Bump `amount` for an even more pronounced
// "the images follow me" feel.
export function ParallaxImage({
  src,
  alt,
  sizes,
  amount = 19,
  unoptimized = false,
  objectPosition,
  scale,
  grayscale = false,
  frameStyle,
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
        className="absolute inset-x-0 -top-[35%] h-[170%] will-change-transform"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          unoptimized={unoptimized}
          className={`object-cover${grayscale ? " grayscale" : ""}`}
          style={objectPosition ? { objectPosition } : undefined}
        />
      </motion.div>
    </div>
  )
}
