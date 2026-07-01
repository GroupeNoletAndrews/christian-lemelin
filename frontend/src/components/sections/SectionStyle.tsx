"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { SlotStyle } from "@/lib/section-style"

// Published per-slot presentation for a section, provided by the page around a
// section component so SlotImage / SlotParallaxImage (and the morph hooks) render
// the owner's reframe/style WITHOUT threading a prop through every component.
// The preview iframe's staged overrides still take precedence (see SlotImage).

const SectionStyleContext = createContext<Record<string, SlotStyle>>({})

export function SectionStyleProvider({
  styles,
  children,
}: {
  styles?: Record<string, SlotStyle>
  children: ReactNode
}) {
  return (
    <SectionStyleContext.Provider value={styles ?? {}}>
      {children}
    </SectionStyleContext.Provider>
  )
}

export function usePublishedSlotStyle(slot: string): SlotStyle | undefined {
  return useContext(SectionStyleContext)[slot]
}
