"use client"

import Image from "next/image"
import { useSlotOverride } from "@/lib/section-preview"

interface SlotImageProps {
  section: string
  slot: string
  /** Server-resolved URL (published override ?? code default). */
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  /** Apply the section's monochrome treatment (design intent, not user-editable). */
  grayscale?: boolean
}

/**
 * A static-section image. Renders the server-resolved published/default `src`,
 * and inside the content-workspace preview iframe overlays the admin's staged
 * (un-published) replacement — so the real page reflects pending edits with
 * nothing uploaded. Always fill; the parent must be positioned.
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
}: SlotImageProps) {
  const override = useSlotOverride(section, slot)
  return (
    <Image
      src={override ?? src}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      sizes={sizes}
      className={`${className ?? ""}${grayscale ? " grayscale" : ""}`.trim()}
    />
  )
}
