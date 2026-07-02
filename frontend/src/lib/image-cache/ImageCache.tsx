"use client"

import { useEffect } from "react"
import { registerImageCache } from "./register"

/**
 * Mount once in the root layout to enable the client-side image cache.
 * Production only — in dev a long-lived cache just gets in the way of
 * iterating on images (and next dev serves everything unoptimized anyway).
 */
export function ImageCache() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    registerImageCache()
  }, [])
  return null
}
