import { revalidatePath } from "next/cache"
import { prisma } from "./prisma"
import { AppError } from "./http"
import { mediaUrl, imgSrc, PLACEHOLDER_SRC } from "@/lib/media"
import { imageUrl } from "@/content/image"
import { getSection, getSlot, type SlotDef } from "@/lib/sections-registry"
import { cleanSlotStyle, type SlotStyle } from "@/lib/section-style"

// Build a SlotStyle from a SectionImage row's transform columns (null if none).
function rowStyle(r: {
  objectPosition: string | null
  zoom: number | null
  grayscale: boolean | null
  borderRadius: string | null
  border: string | null
}): SlotStyle | null {
  return cleanSlotStyle({
    objectPosition: r.objectPosition,
    zoom: r.zoom,
    grayscale: r.grayscale,
    borderRadius: r.borderRadius,
    border: r.border,
  })
}

// ===========================================================================
// Static-section published image overrides (staged model — drafts live in the
// browser; only the published key is stored here). resolveSectionImages feeds
// the public pages (force-dynamic); the SlotImage client overlay handles the
// real-page preview before publish.
// ===========================================================================

const PICSUM_W = 1600
const PICSUM_H = 1200

type Override = { key: string; v: number }

/**
 * Whether un-edited slots show the "no photo yet" placeholder instead of the
 * baked-in code default. ON in production by default (the owner uploads real
 * photos via the admin and the prod bucket starts empty); force on/off anywhere
 * with IMAGE_PLACEHOLDERS=true|false (e.g. to preview the empty state in dev).
 */
function placeholdersEnabled(): boolean {
  const flag = process.env.IMAGE_PLACEHOLDERS
  if (flag === "true") return true
  if (flag === "false") return false
  return process.env.NODE_ENV === "production"
}

// Published override keys for a section. Pages that render these are
// `force-dynamic`, so a fresh read reflects a publish immediately; `v`
// (updatedAt ms) versions the URL so a same-key overwrite is served fresh.
async function getPublishedKeys(section: string): Promise<Record<string, Override>> {
  const rows = await prisma.sectionImage.findMany({ where: { section } })
  return Object.fromEntries(
    rows.map((r) => [r.slot, { key: r.key, v: r.updatedAt.getTime() }]),
  )
}

function resolveSlotUrl(slot: SlotDef, override: Override | undefined): string {
  if (override) return imgSrc(override.key, override.v)
  // No override + placeholders on → empty, so the admin slot row shows its
  // "no image, click Remplacer" state (matching the public placeholder).
  if (placeholdersEnabled()) return ""
  if (slot.source === "site-media") return mediaUrl(slot.default)
  return imageUrl(
    { seed: slot.default, alt: "", grayscale: slot.grayscale },
    PICSUM_W,
    PICSUM_H,
  )
}

/**
 * Section image URLs keyed by slot. Always includes overridden slots (the
 * owner's published photo). For un-overridden slots: in prod, emits the
 * placeholder sentinel (PLACEHOLDER_SRC); in dev, omits the slot so the
 * component keeps its byte-identical code default.
 */
export async function resolveSectionImages(
  section: string,
): Promise<Record<string, string>> {
  const def = getSection(section)
  if (!def) return {}
  const published = await getPublishedKeys(section)
  const placeholders = placeholdersEnabled()
  const out: Record<string, string> = {}
  for (const slot of def.slots) {
    const ov = published[slot.id]
    if (ov) out[slot.id] = imgSrc(ov.key, ov.v)
    // No owner override: in prod, emit the placeholder sentinel so the slot
    // renders the "Image à venir" block; in dev, omit it so the component keeps
    // its byte-identical code default.
    else if (placeholders) out[slot.id] = PLACEHOLDER_SRC
  }
  return out
}

/**
 * Published per-slot presentation (focal point / zoom / grayscale / border),
 * keyed by slot. Feeds the public pages alongside resolveSectionImages so a
 * published reframe/style shows immediately. Only slots with a real override
 * are present.
 */
export async function resolveSectionStyles(
  section: string,
): Promise<Record<string, SlotStyle>> {
  const def = getSection(section)
  if (!def) return {}
  const rows = await prisma.sectionImage.findMany({ where: { section } })
  const out: Record<string, SlotStyle> = {}
  for (const r of rows) {
    const style = rowStyle(r)
    if (style) out[r.slot] = style
  }
  return out
}

/** Admin view: each slot with its current published key + resolved URL. Uncached. */
export async function getSectionAdminState(section: string) {
  const def = getSection(section)
  if (!def) return null
  const rows = await prisma.sectionImage.findMany({ where: { section } })
  const bySlot = new Map(rows.map((r) => [r.slot, r]))
  const slots = def.slots.map((slot) => {
    const row = bySlot.get(slot.id)
    const override = row ? { key: row.key, v: row.updatedAt.getTime() } : undefined
    return {
      id: slot.id,
      label: slot.label,
      aspect: slot.aspect,
      /** Baked-in grayscale design default (the filter toggle starts here). */
      grayscaleDefault: !!slot.grayscale,
      publishedKey: row?.key ?? null,
      url: resolveSlotUrl(slot, override),
      style: row ? rowStyle(row) : null,
    }
  })
  return {
    section: def.id,
    label: def.label,
    previewPath: def.previewPath,
    caps: def.caps,
    slots,
  }
}

// Style columns for a Prisma write (null clears a previously-set value).
function styleCols(style?: SlotStyle | null) {
  const c = cleanSlotStyle(style)
  return {
    objectPosition: c?.objectPosition ?? null,
    zoom: c?.zoom ?? null,
    grayscale: c?.grayscale ?? null,
    borderRadius: c?.borderRadius ?? null,
    border: c?.border ?? null,
  }
}

/**
 * Publish staged slot changes, then revalidate the section's routes. Each change
 * may carry a new image `key`, a `style` (focal/zoom/grayscale/border), or both:
 *  - with a key → upsert the row (image ± style);
 *  - style-only → update the existing row (a reframe needs a published image, so
 *    the row already exists; if it somehow doesn't, updateMany no-ops safely).
 */
export async function publishSectionImages(
  section: string,
  changes: { slot: string; key?: string; style?: SlotStyle | null }[],
): Promise<void> {
  const def = getSection(section)
  if (!def) throw new AppError(400, "Section inconnue")
  for (const c of changes) {
    if (!getSlot(section, c.slot)) throw new AppError(400, `Slot inconnu: ${c.slot}`)
  }
  // `style === undefined` means "image only, leave presentation untouched";
  // `null` means "reset presentation"; an object sets it.
  const writes = changes
    .map((c) => {
      const sc = c.style !== undefined ? styleCols(c.style) : {}
      if (c.key) {
        return prisma.sectionImage.upsert({
          where: { section_slot: { section, slot: c.slot } },
          create: { section, slot: c.slot, key: c.key, ...sc },
          update: { key: c.key, ...sc },
        })
      }
      if (c.style !== undefined) {
        return prisma.sectionImage.updateMany({
          where: { section, slot: c.slot },
          data: sc,
        })
      }
      return null
    })
    .filter((w): w is NonNullable<typeof w> => w !== null)
  if (writes.length) await prisma.$transaction(writes)
  for (const path of def.revalidate) revalidatePath(path)
}
