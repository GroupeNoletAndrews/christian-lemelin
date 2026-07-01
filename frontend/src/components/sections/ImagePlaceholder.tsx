"use client"

import { ImageSquare } from "@phosphor-icons/react"

/**
 * Neutral "no photo set yet" placeholder for an editable image slot. Fills its
 * positioned parent exactly like <Image fill> / ParallaxImage, so it drops into
 * SlotImage / SlotParallaxImage with no layout change. Shown until the owner
 * uploads a photo for the slot (production by default — see resolveSectionImages
 * / placeholdersEnabled).
 */
export function ImagePlaceholder({ label = "Image à venir" }: { label?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-elevated text-foreground-muted">
      <ImageSquare size={26} weight="light" />
      <span className="font-mono text-[10px] uppercase tracking-[0.16em]">
        {label}
      </span>
    </div>
  )
}
