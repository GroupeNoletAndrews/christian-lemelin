"use client"

import { ParallaxImage } from "@/components/ui/ParallaxImage"
import { useSlotOverride, useSlotStyleOverride } from "@/lib/section-preview"
import { PLACEHOLDER_SRC, isUnoptimizedSrc } from "@/lib/media"
import { slotBoxCss, type SlotStyle } from "@/lib/section-style"
import { usePublishedSlotStyle } from "@/components/sections/SectionStyle"
import { ImagePlaceholder } from "@/components/sections/ImagePlaceholder"

interface SlotParallaxImageProps {
  section: string
  slot: string
  /** Resolved URL (published override ?? the component's code default). */
  src: string
  alt: string
  sizes?: string
  amount?: number
  unoptimized?: boolean
  /** Section's monochrome design default (overridable by styleMeta). */
  grayscale?: boolean
  /** Published presentation (focal/zoom/grayscale/border) for this slot. */
  styleMeta?: SlotStyle | null
}

/**
 * ParallaxImage for an editable static-section slot: renders the given `src`
 * with its published presentation, and inside the content-workspace preview
 * iframe overlays the staged replacement + staged reframe/style.
 */
export function SlotParallaxImage({
  section,
  slot,
  src,
  alt,
  sizes,
  amount,
  unoptimized,
  grayscale,
  styleMeta,
}: SlotParallaxImageProps) {
  const override = useSlotOverride(section, slot)
  const styleOverride = useSlotStyleOverride(section, slot)
  const published = usePublishedSlotStyle(slot)
  const resolved = override ?? src
  // No owner-set photo yet (prod sentinel, or genuinely empty) → placeholder.
  if (!resolved || resolved === PLACEHOLDER_SRC) return <ImagePlaceholder />
  const style = styleOverride ?? published ?? styleMeta ?? null
  return (
    <ParallaxImage
      src={resolved}
      alt={alt}
      sizes={sizes}
      amount={amount}
      unoptimized={unoptimized || isUnoptimizedSrc(resolved)}
      objectPosition={style?.objectPosition ?? undefined}
      scale={style?.zoom ?? undefined}
      grayscale={style?.grayscale ?? grayscale}
      frameStyle={slotBoxCss(style)}
    />
  )
}
