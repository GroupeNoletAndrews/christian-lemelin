import { revalidatePath } from "next/cache"
import { prisma } from "./prisma"
import { AppError } from "./http"
import { mediaUrl, imgSrc, PLACEHOLDER_SRC } from "@/lib/media"
import { imageUrl } from "@/content/image"
import { getSection, getSlot, type SlotDef } from "@/lib/sections-registry"

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
      publishedKey: row?.key ?? null,
      url: resolveSlotUrl(slot, override),
    }
  })
  return { section: def.id, label: def.label, previewPath: def.previewPath, slots }
}

/** Publish staged slot changes: upsert keys, then revalidate the section's routes. */
export async function publishSectionImages(
  section: string,
  changes: { slot: string; key: string }[],
): Promise<void> {
  const def = getSection(section)
  if (!def) throw new AppError(400, "Section inconnue")
  for (const c of changes) {
    if (!getSlot(section, c.slot)) throw new AppError(400, `Slot inconnu: ${c.slot}`)
  }
  if (changes.length) {
    await prisma.$transaction(
      changes.map((c) =>
        prisma.sectionImage.upsert({
          where: { section_slot: { section, slot: c.slot } },
          create: { section, slot: c.slot, key: c.key },
          update: { key: c.key },
        }),
      ),
    )
  }
  for (const path of def.revalidate) revalidatePath(path)
}
