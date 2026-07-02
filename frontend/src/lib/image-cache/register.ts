// Registration half of the drop-in image cache (the worker itself lives in
// public/image-cache-sw.js). See README.md in this folder to reuse elsewhere.

const SW_URL = "/image-cache-sw.js"

/**
 * Register the image-cache service worker. Safe to call unconditionally on
 * every page: it no-ops without SW support, in the admin, and inside the
 * content-workspace preview iframe (staged edits there use data:/blob: URLs
 * the worker never sees anyway, but registering from a preview is pointless).
 */
export function registerImageCache(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
  if (window.location.pathname.startsWith("/admin")) return
  if (document.documentElement.classList.contains("cl-preview")) return
  navigator.serviceWorker.register(SW_URL).catch(() => {
    // Non-fatal: the site works identically without the cache.
  })
}

/** Remove the worker + its cache (debugging / opting a project back out). */
export async function unregisterImageCache(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(
    registrations
      .filter((r) => r.active?.scriptURL.endsWith(SW_URL))
      .map((r) => r.unregister()),
  )
  for (const key of await caches.keys()) {
    if (key.startsWith("cl-images-")) await caches.delete(key)
  }
}
