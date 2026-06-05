import type { ImageRef } from "./types"

// Centralises the site-wide picsum placeholder convention
// (`https://picsum.photos/seed/<seed>/<w>/<h>`). Swap this single helper when
// real photography arrives (and add the host to next.config.ts then).
const BASE = "https://picsum.photos/seed"

export function picsum(seed: string, w: number, h: number, grayscale = false): string {
  return `${BASE}/${seed}/${w}/${h}${grayscale ? "?grayscale" : ""}`
}

export function imageUrl(ref: ImageRef, w: number, h: number): string {
  return picsum(ref.seed, w, h, ref.grayscale)
}
