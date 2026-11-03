"use client"

import type { ReactNode } from "react"
import { useSlotOverride } from "@/lib/section-preview"
import { PLACEHOLDER_SRC } from "@/lib/media"

interface OptionalSlotProps {
  section: string
  slot: string
  /** Server-resolved URL: empty or the placeholder sentinel when no photo is published. */
  src: string
  /** The slot's frame + image. */
  children: ReactNode
}

/**
 * For an editable image slot the page can do without: renders the slot's frame
 * only once it has a photo, instead of the "Image à venir" tile, so the layout
 * closes up around it. A client component because the photo may be one the admin
 * has only staged so far — it must appear in the content-workspace preview before
 * anything is published. The slot stays editable in the admin like any other.
 */
export function OptionalSlot({ section, slot, src, children }: OptionalSlotProps) {
  const override = useSlotOverride(section, slot)
  const resolved = override ?? src
  if (!resolved || resolved === PLACEHOLDER_SRC) return null
  return children
}
