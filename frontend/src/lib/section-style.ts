import type { CSSProperties } from "react"

// Non-destructive per-slot presentation, shared by the server resolver, the live
// render (SlotImage / SlotParallaxImage / morph images) and the admin editor +
// preview so they always agree. Mirrors the optional columns on Prisma's
// SectionImage. The image always fills its fixed, layout-driven box — these only
// change WHICH part shows (focal point + zoom) and its finish. Box size is never
// touched, so responsiveness is preserved.

export type SlotStyle = {
  /** focal point → CSS object-position, e.g. "50% 30%" */
  objectPosition?: string | null
  /** zoom within the box (scale), 1 = 100% */
  zoom?: number | null
  /** override the section's baked-in grayscale default (null = keep default) */
  grayscale?: boolean | null
  /** e.g. "16px" */
  borderRadius?: string | null
  /** CSS border shorthand, e.g. "1px solid #cccccc" */
  border?: string | null
}

/** Which controls the admin may use for a slot — gated per section. */
export type SlotCaps = { reframe: boolean; filter: boolean; style: boolean }

export const FULL_CAPS: SlotCaps = { reframe: true, filter: true, style: true }
/** Images-only sections (À propos, Solutions): reframe the photo, nothing else. */
export const REFRAME_ONLY_CAPS: SlotCaps = { reframe: true, filter: false, style: false }

/** CSS for the <img> element: focal point + zoom (grayscale is a CSS class). */
export function slotImgCss(s?: SlotStyle | null): CSSProperties {
  if (!s) return {}
  const css: CSSProperties = {}
  if (s.objectPosition) {
    css.objectPosition = s.objectPosition
    css.transformOrigin = s.objectPosition
  }
  if (s.zoom && s.zoom !== 1) css.transform = `scale(${s.zoom})`
  return css
}

/** CSS for the framing box: rounded corners + border. */
export function slotBoxCss(s?: SlotStyle | null): CSSProperties {
  if (!s) return {}
  const css: CSSProperties = {}
  if (s.borderRadius) css.borderRadius = s.borderRadius
  if (s.border) css.border = s.border
  return css
}

/** Whether a style carries any non-default presentation (so we can skip work). */
export function hasSlotStyle(s?: SlotStyle | null): boolean {
  return (
    !!s &&
    (!!s.objectPosition ||
      (s.zoom != null && s.zoom !== 1) ||
      s.grayscale != null ||
      !!s.borderRadius ||
      !!s.border)
  )
}

/** Drop null/undefined/default fields so we only persist real overrides. */
export function cleanSlotStyle(s?: SlotStyle | null): SlotStyle | null {
  if (!s) return null
  const out: SlotStyle = {}
  if (s.objectPosition) out.objectPosition = s.objectPosition
  if (s.zoom != null && s.zoom !== 1) out.zoom = s.zoom
  if (s.grayscale != null) out.grayscale = s.grayscale
  if (s.borderRadius) out.borderRadius = s.borderRadius
  if (s.border) out.border = s.border
  return Object.keys(out).length ? out : null
}
