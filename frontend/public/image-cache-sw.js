/**
 * image-cache-sw.js — drop-in service worker caching SITE IMAGES client-side.
 * Registered by src/lib/image-cache/ (see its README for reuse in another
 * project). Scope: the whole origin (served from /).
 *
 * Strategy, per request (images only — request.destination === "image"):
 *   - "immutable"  (URL carries a ?v= version marker, or a /_next/image URL
 *     whose inner url does): cache-first, never revalidated. The app busts
 *     these by CHANGING the URL (?v=updatedAt), so a hit is always current.
 *   - "swr" (un-versioned bucket/optimizer image, e.g. static logos):
 *     stale-while-revalidate — serve the cached copy instantly, refresh it in
 *     the background for the next visit.
 * Everything else (pages, API, videos — range requests don't mix with opaque
 * responses) is left to the network untouched.
 */

const CACHE = "cl-images-v1"
const MAX_ENTRIES = 300

// Matches Supabase Storage public objects (any project host) and the Next
// image optimizer route. Adjust for another storage provider if needed.
const STORAGE_PATH = "/storage/v1/object/public/"
const OPTIMIZER_PATH = "/_next/image"

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Drop caches from older SW versions (bump CACHE to invalidate en masse).
      for (const key of await caches.keys()) {
        if (key.startsWith("cl-images-") && key !== CACHE) await caches.delete(key)
      }
      await self.clients.claim()
    })(),
  )
})

/** "immutable" | "swr" | null (null = don't touch the request). */
function classify(request) {
  if (request.method !== "GET" || request.destination !== "image") return null
  let url
  try {
    url = new URL(request.url)
  } catch {
    return null
  }
  if (url.pathname === OPTIMIZER_PATH) {
    const inner = url.searchParams.get("url") ?? ""
    return /[?&]v=/.test(inner) ? "immutable" : "swr"
  }
  if (url.pathname.includes(STORAGE_PATH)) {
    return url.searchParams.has("v") ? "immutable" : "swr"
  }
  return null
}

/** Cacheable = OK response, or opaque (no-cors <img> to another origin). */
function cacheable(response) {
  return response && (response.ok || response.type === "opaque")
}

async function put(cache, request, response) {
  await cache.put(request, response)
  // FIFO trim — Cache API keys() returns entries in insertion order.
  const keys = await cache.keys()
  if (keys.length > MAX_ENTRIES) {
    await Promise.all(keys.slice(0, keys.length - MAX_ENTRIES).map((k) => cache.delete(k)))
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(request)
  if (hit) return hit
  const response = await fetch(request)
  if (cacheable(response)) await put(cache, request, response.clone())
  return response
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(request)
  const refresh = fetch(request)
    .then(async (response) => {
      if (cacheable(response)) await put(cache, request, response.clone())
      return response
    })
    .catch(() => undefined)
  if (hit) return hit
  const fresh = await refresh
  if (fresh) return fresh
  return fetch(request)
}

self.addEventListener("fetch", (event) => {
  const strategy = classify(event.request)
  if (strategy === "immutable") {
    event.respondWith(cacheFirst(event.request))
  } else if (strategy === "swr") {
    event.respondWith(staleWhileRevalidate(event.request))
  }
})
