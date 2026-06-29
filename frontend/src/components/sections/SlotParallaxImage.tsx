"use client"

import { ParallaxImage } from "@/components/ui/ParallaxImage"
import { useSlotOverride } from "@/lib/section-preview"

interface SlotParallaxImageProps {
  section: string
  slot: string
  /** Resolved URL (published override ?? the component's code default). */
  src: string
  alt: string
  sizes?: string
  amount?: number
  unoptimized?: boolean
}

/**
 * ParallaxImage for an editable static-section slot: renders the given `src`,
 * and inside the content-workspace preview iframe overlays the staged
 * (un-published) replacement (a data: URL, which must be unoptimized).
 */
export function SlotParallaxImage({
  section,
  slot,
  src,
  alt,
  sizes,
  amount,
  unoptimized,
}: SlotParallaxImageProps) {
  const override = useSlotOverride(section, slot)
  return (
    <ParallaxImage
      src={override ?? src}
      alt={alt}
      sizes={sizes}
      amount={amount}
      unoptimized={override ? true : unoptimized}
    />
  )
}
