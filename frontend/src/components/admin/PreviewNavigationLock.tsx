"use client"

import { useEffect } from "react"
import { useAdmin } from "@/lib/admin-context"

/**
 * Inside the content-workspace preview iframe, internal links (the site header
 * logo, footer links, nav menu, in-content CTAs) would navigate the iframe away
 * from the page being previewed — breaking the "Aperçu — page réelle" preview.
 *
 * While in preview (and only inside the iframe), we cancel link clicks that
 * would leave the current page so the preview stays pinned. Cancelling is
 * `preventDefault` only (no `stopPropagation`), which Next's `<Link>` honours,
 * so it doesn't interfere with the in-place edit affordances (those are
 * `<button>`s) or other click handlers. External / new-tab / download links and
 * same-page hash links are left alone.
 */
export function PreviewNavigationLock() {
  const { previewEdit } = useAdmin()

  useEffect(() => {
    if (!previewEdit) return
    // Only lock inside the actual preview iframe — a standalone ?preview visit
    // should still navigate normally.
    if (typeof window === "undefined" || window.parent === window) return

    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return
      }
      const anchor = (e.target as Element | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null
      if (
        !anchor ||
        (anchor.target && anchor.target !== "_self") ||
        anchor.hasAttribute("download")
      ) {
        return
      }
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return // external — opens elsewhere
      // Same page (e.g. a #hash anchor) — allow it to scroll.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return
      }
      e.preventDefault() // cancel the navigation; <Link> respects defaultPrevented
    }

    document.addEventListener("click", onClick, true) // capture, before <Link>'s handler
    return () => document.removeEventListener("click", onClick, true)
  }, [previewEdit])

  return null
}
