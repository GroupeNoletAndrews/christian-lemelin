"use client"

import { useEffect, useState } from "react"

/**
 * SSR-safe media-query hook. Returns `false` on the server and on the first
 * client render, then updates after mount — so it never causes a hydration
 * mismatch. Extracted from the inline `matchMedia` pattern in Solutions.tsx.
 *
 * @example const isDesktop = useMediaQuery("(min-width: 768px)")
 * @example const canHover = useMediaQuery("(hover: hover)")
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [query])

  return matches
}
