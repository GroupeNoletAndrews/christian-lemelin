import { revalidatePath } from "next/cache"
import { prisma } from "./prisma"
import { AppError } from "./http"
import { mediaUrl, imgSrc } from "@/lib/media"
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
  if (slot.source === "site-media") return mediaUrl(slot.default)
  return imageUrl(
    { seed: slot.default, alt: "", grayscale: slot.grayscale },
    PICSUM_W,
    PICSUM_H,
  )
}

/**
 * Published override URLs for a section, keyed by slot — ONLY for slots that
 * have an override. Components fall back to their own code default for the rest,
 * so un-edited slots render byte-identically to today.
 */
export async function resolveSectionImages(
  section: string,
): Promise<Record<string, string>> {
  const def = getSection(section)
  if (!def) return {}
  const published = await getPublishedKeys(section)
  const out: Record<string, string> = {}
  for (const slot of def.slots) {
    const ov = published[slot.id]
    if (ov) out[slot.id] = imgSrc(ov.key, ov.v)
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
