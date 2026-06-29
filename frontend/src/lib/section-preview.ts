"use client"

import { useSyncExternalStore } from "react"

// Staged image overrides pushed by the content workspace into the preview iframe
// (postMessage). Keyed by "section/slot" → a data: URL. Lets the REAL page show
// un-published edits without any upload; only active inside the preview iframe.

const overrides = new Map<string, string>()
const listeners = new Set<() => void>()
let started = false

function start() {
  if (started || typeof window === "undefined") return
  started = true
  window.addEventListener("message", (e) => {
    if (e.origin !== window.location.origin) return
    if (e.data?.source !== "cl-content-admin" || e.data?.type !== "preview-section")
      return
    const section = e.data.section as string
    const ov = (e.data.overrides ?? {}) as Record<string, string>
    // Replace just this section's overrides.
    for (const k of [...overrides.keys()]) {
      if (k.startsWith(`${section}/`)) overrides.delete(k)
    }
    for (const [slot, url] of Object.entries(ov)) overrides.set(`${section}/${slot}`, url)
    listeners.forEach((l) => l())
  })
}

function subscribe(cb: () => void) {
  start()
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/** The staged override URL for a slot, or undefined. Updates live in the preview iframe. */
export function useSlotOverride(section: string, slot: string): string | undefined {
  return useSyncExternalStore(
    subscribe,
    () => overrides.get(`${section}/${slot}`),
    () => undefined,
  )
}
