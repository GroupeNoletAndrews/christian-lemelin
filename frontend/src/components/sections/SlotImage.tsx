"use client"

import Image from "next/image"
import { useSlotOverride, useSlotStyleOverride } from "@/lib/section-preview"
import { PLACEHOLDER_SRC, isUnoptimizedSrc } from "@/lib/media"
import { slotBoxCss, slotImgCss, type SlotStyle } from "@/lib/section-style"
import { usePublishedSlotStyle } from "@/components/sections/SectionStyle"
import { ImagePlaceholder } from "@/components/sections/ImagePlaceholder"

interface SlotImageProps {
  section: string
  slot: string
  /** Server-resolved URL (published override ?? code default). */
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  /** Apply the section's monochrome treatment (design intent, code default). */
  grayscale?: boolean
  /** Published presentation (focal/zoom/grayscale/border) for this slot. */
  styleMeta?: SlotStyle | null
}

/**
 * A static-section image. Renders the server-resolved published/default `src`
 * with its published presentation, and inside the content-workspace preview
 * iframe overlays the admin's staged replacement AND staged reframe/style — so
 * the real page reflects pending edits with nothing uploaded. Always fill; the
 * parent must be positioned + clip (overflow-hidden) for zoom to crop cleanly.
 */
export function SlotImage({
  section,
  slot,
  src,
  alt,
  className,
  sizes,
  priority,
  grayscale,
  styleMeta,
}: SlotImageProps) {
  const override = useSlotOverride(section, slot)
  const styleOverride = useSlotStyleOverride(section, slot)
  const published = usePublishedSlotStyle(slot)
  const resolved = override ?? src
  // No owner-set photo yet (prod sentinel, or genuinely empty) → placeholder.
  if (!resolved || resolved === PLACEHOLDER_SRC) return <ImagePlaceholder />
  // Staged preview override wins; then published; then any explicit prop.
  const style = styleOverride ?? published ?? styleMeta ?? null
  // Explicit grayscale override wins; else the section's baked default.
  const gray = style?.grayscale ?? grayscale
  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      unoptimized={isUnoptimizedSrc(resolved)}
      priority={priority}
      sizes={sizes}
      data-cl-section={section}
      data-cl-slot={slot}
      className={`${className ?? ""}${gray ? " grayscale" : ""}`.trim()}
      style={{ ...slotImgCss(style), ...slotBoxCss(style) }}
    />
  )
}
