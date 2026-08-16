"use client"

import { useSyncExternalStore } from "react"
import type { SlotStyle } from "@/lib/section-style"

// Staged overrides pushed by the content workspace into the preview iframe
// (postMessage). Two independent maps, both keyed by "section/slot":
//   • image  → a data: URL (a not-yet-uploaded replacement)
//   • style  → focal point / zoom / grayscale / border (a not-yet-published reframe)
// Lets the REAL page reflect un-published edits live; only active in the iframe.

const overrides = new Map<string, string>()
const styleOverrides = new Map<string, SlotStyle>()
// Gallery sections: the staged ORDER (and therefore the staged COUNT) of a
// section's photos, keyed by section. Membership cannot be staged per-slot like
// an image can — the list itself is what changed — so it rides along separately.
const orderOverrides = new Map<string, string[]>()
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
    const st = (e.data.styles ?? {}) as Record<string, SlotStyle>
    const order = e.data.order as string[] | undefined
    if (Array.isArray(order)) orderOverrides.set(section, order)
    else orderOverrides.delete(section)
    // Replace just this section's entries in both maps.
    for (const k of [...overrides.keys()]) {
      if (k.startsWith(`${section}/`)) overrides.delete(k)
    }
    for (const k of [...styleOverrides.keys()]) {
      if (k.startsWith(`${section}/`)) styleOverrides.delete(k)
    }
    for (const [slot, url] of Object.entries(ov)) overrides.set(`${section}/${slot}`, url)
    for (const [slot, style] of Object.entries(st)) {
      if (style) styleOverrides.set(`${section}/${slot}`, style)
    }
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

/** The staged image override URL for a slot, or undefined. Live in the preview iframe. */
export function useSlotOverride(section: string, slot: string): string | undefined {
  return useSyncExternalStore(
    subscribe,
    () => overrides.get(`${section}/${slot}`),
    () => undefined,
  )
}

/** The staged presentation (focal/zoom/style) override for a slot, or undefined. */
export function useSlotStyleOverride(section: string, slot: string): SlotStyle | undefined {
  return useSyncExternalStore(
    subscribe,
    () => styleOverrides.get(`${section}/${slot}`),
    () => undefined,
  )
}

/**
 * The staged photo order for a gallery section, or undefined. Lets the real
 * page show photos the owner has ADDED (and hide ones they removed) before
 * anything is uploaded — the published list still comes from the server.
 */
export function useSectionOrderOverride(section: string): string[] | undefined {
  return useSyncExternalStore(
    subscribe,
    () => orderOverrides.get(section),
    () => undefined,
  )
}
