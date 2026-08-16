import { revalidatePath } from "next/cache"
import { prisma } from "./prisma"
import { deleteMediaObjects, existingMediaValues } from "./storage"
import { AppError } from "./http"
import { mediaUrl, imgSrc, PLACEHOLDER_SRC } from "@/lib/media"
import { imageUrl } from "@/content/image"
import {
  gallerySlotDef,
  getSection,
  getSlot,
  sectionSlotKey,
  type SectionDef,
  type SlotDef,
} from "@/lib/sections-registry"
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
  // Drop overrides whose storage object no longer exists (e.g. the file was
  // deleted straight from Supabase Storage while its DB row lingered): the slot
  // then falls back to the placeholder / code default instead of rendering a
  // dangling URL the browser or image optimiser would still serve from cache.
  // existingMediaValues is fail-open, so a storage hiccup keeps the image.
  const present = await existingMediaValues(rows.map((r) => r.key))
  return Object.fromEntries(
    rows
      .filter((r) => present.has(r.key))
      .map((r) => [r.slot, { key: r.key, v: r.updatedAt.getTime() }]),
  )
}

// ---------------------------------------------------------------------------
// Gallery sections — the owner decides HOW MANY photos (see GalleryDef).
// ---------------------------------------------------------------------------

/**
 * The ordered slot ids of a gallery section. The stored list wins; if it is
 * missing or unusable we fall back to the registry order, so a section that has
 * never been edited (and every photo already published against it) behaves
 * exactly as before this became a gallery.
 */
async function galleryOrder(def: SectionDef): Promise<string[]> {
  if (!def.gallery) return def.slots.map((s) => s.id)
  const row = await prisma.siteSetting.findUnique({
    where: { key: def.gallery.settingKey },
  })
  if (!row) return def.slots.map((s) => s.id)
  try {
    const parsed: unknown = JSON.parse(row.value)
    const ids = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : []
    // An empty stored list would silently blank the section; treat it as unset.
    return ids.length ? ids : def.slots.map((s) => s.id)
  } catch {
    return def.slots.map((s) => s.id)
  }
}

/** The slots a section actually renders, in order — the registry's fixed list,
 *  or the owner's list for a gallery section. */
async function orderedSlots(def: SectionDef): Promise<SlotDef[]> {
  if (!def.gallery) return def.slots
  const ids = await galleryOrder(def)
  return ids.map((id, i) => gallerySlotDef(def, id, i))
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
  for (const slot of await orderedSlots(def)) {
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
 * A gallery section's photos, IN ORDER, for the public page. A plain record
 * keyed by slot cannot carry order, and the count is no longer known to the
 * component — so the page passes this straight through.
 */
export async function resolveSectionGallery(
  section: string,
): Promise<{ slot: string; url: string }[]> {
  const def = getSection(section)
  if (!def) return []
  const published = await getPublishedKeys(section)
  const placeholders = placeholdersEnabled()
  const slots = await orderedSlots(def)
  return slots.map((slot) => {
    const ov = published[slot.id]
    if (ov) return { slot: slot.id, url: imgSrc(ov.key, ov.v) }
    if (placeholders) return { slot: slot.id, url: PLACEHOLDER_SRC }
    return { slot: slot.id, url: resolveSlotUrl(slot, undefined) }
  })
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
  // Treat a row whose storage object is gone as "no override" so the editor
  // shows the placeholder (and can re-upload), matching the public page.
  const present = await existingMediaValues(rows.map((r) => r.key))
  const bySlot = new Map(rows.map((r) => [r.slot, r]))
  const slots = (await orderedSlots(def)).map((slot) => {
    const row = bySlot.get(slot.id)
    const has = !!row && present.has(row.key)
    const override = has ? { key: row!.key, v: row!.updatedAt.getTime() } : undefined
    return {
      id: slot.id,
      label: slot.label,
      aspect: slot.aspect,
      /** Baked-in grayscale design default (the filter toggle starts here). */
      grayscaleDefault: !!slot.grayscale,
      publishedKey: has ? row!.key : null,
      url: resolveSlotUrl(slot, override),
      style: has ? rowStyle(row!) : null,
    }
  })
  return {
    section: def.id,
    label: def.label,
    previewPath: def.previewPath,
    caps: def.caps,
    // Present only for gallery sections — the editor shows add/remove/reorder
    // controls when it is, and the fixed slot list when it is not.
    gallery: def.gallery ? { label: def.gallery.label, aspect: def.gallery.aspect, min: def.gallery.min } : null,
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
  /** Gallery sections only: the owner's new ordered slot-id list. */
  order?: string[],
): Promise<void> {
  const def = getSection(section)
  if (!def) throw new AppError(400, "Section inconnue")
  // A gallery's slot ids are minted by the admin, so they are NOT in the
  // registry — validate them against the incoming order instead (which is the
  // list about to become live), falling back to what is already stored.
  const allowed = def.gallery
    ? new Set(order ?? (await galleryOrder(def)))
    : null
  for (const c of changes) {
    const ok = allowed ? allowed.has(c.slot) : !!getSlot(section, c.slot)
    if (!ok) throw new AppError(400, `Slot inconnu: ${c.slot}`)
  }
  if (def.gallery && order) {
    if (order.length < def.gallery.min) {
      throw new AppError(400, `Il faut au moins ${def.gallery.min} photo(s).`)
    }
    if (new Set(order).size !== order.length) {
      throw new AppError(400, "Photos en double dans l'ordre envoyé.")
    }
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

  if (def.gallery && order) {
    const gone = (await galleryOrder(def)).filter((id) => !order.includes(id))
    // Order first: it is what the public page reads, so the dropped photos stop
    // rendering even if the cleanup below fails.
    await prisma.siteSetting.upsert({
      where: { key: def.gallery.settingKey },
      create: { key: def.gallery.settingKey, value: JSON.stringify(order) },
      update: { value: JSON.stringify(order) },
    })
    if (gone.length) {
      await prisma.sectionImage.deleteMany({ where: { section, slot: { in: gone } } })
      // Best-effort: drop the storage objects too, so a removed photo does not
      // keep eating the bucket quota. A failure here is not worth failing the
      // publish over — the photo is already off the site.
      try {
        await deleteMediaObjects(gone.map((slot) => sectionSlotKey(section, slot)))
      } catch (e) {
        console.warn("Nettoyage du stockage impossible:", e)
      }
    }
  }

  for (const path of def.revalidate) revalidatePath(path)
}
