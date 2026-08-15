import type { ImageRef } from "./types"
import { mediaUrl, MEDIA_FOLDERS, SITE_MEDIA } from "@/lib/media"
import { MEDIA_MANIFEST } from "./media-manifest"

// Site content images resolve to a real photo in Supabase Storage when one has
// been uploaded to the matching section folder of the `christian-alain` bucket;
// otherwise they fall back to another REAL company photo (FALLBACK_KEYS below —
// picsum is no longer used). This allows a gradual, section-by-section
// migration with zero breakage:
//
//   1. Add a photo named "<seed>.<ext>" (e.g. ecl-about-atelier-large.jpg)
//      under photos/<section>/ in the bucket (Supabase Studio upload, or drop
//      it in frontend/public and wire it into the sync script).
//   2. Run `npm run media:sync` (re-lists the bucket → regenerates the manifest).
//   3. imageUrl() now returns the Supabase URL for that seed; everything else
//      keeps borrowing a photo from the fallback pool until photographed.

const BASE = "https://picsum.photos/seed"

export function picsum(seed: string, w: number, h: number, grayscale = false): string {
  return `${BASE}/${seed}/${w}/${h}${grayscale ? "?grayscale" : ""}`
}

// Which christian-alain folder a content image belongs to, keyed by seed prefix.
// The prod bucket only has these photo folders, so materials + installations map
// into existing ones. Adjust here if you reorganise. Seeds with no rule always
// go to the fallback pool.
const SEED_FOLDER_RULES: [RegExp, string][] = [
  [/^ecl-about-/, MEDIA_FOLDERS.aPropos],
  [/^ecl-install-/, MEDIA_FOLDERS.aPropos],
  [/^ecl-sol-/, MEDIA_FOLDERS.solutions],
  [/^ecl-(inox|acier|aluminium|laiton|cuivre)-/, MEDIA_FOLDERS.fabrication],
]

function folderForSeed(seed: string): string | null {
  for (const [re, folder] of SEED_FOLDER_RULES) if (re.test(seed)) return folder
  return null
}

// "<folder>/<seed>" (extension stripped) → the actual stored key, from the
// manifest. Lets an uploaded ecl-about-atelier-large.jpg OR .png/.webp match.
const KEY_BY_STEM = new Map<string, string>(
  MEDIA_MANIFEST.map((key) => [key.replace(/\.[^/.]+$/, ""), key]),
)

// Fallback pool — REAL company photos, uploaded to the bucket in every
// environment by scripts/sync-site-media.ts. A seed with no photographed
// counterpart used to fall back to picsum, i.e. random stock (a coffee cup
// under "Mobilier hospitalier"). Reusing the real site photos is a better
// stand-in: duplicates across sections are accepted deliberately until the
// owner photographs each slot. Remove a key here only if it also leaves
// SITE_MEDIA / the sync script.
//
// NOT in the pool: SITE_MEDIA.savoirFaire.fabrication. Its source
// (public/assets/…IMG_1292.jpeg) is 3.7 MB — nine times the next largest — and
// some consumers of imageUrl() render a RAW <img> that bypasses the Next
// optimizer (SolutionsTimeline), so pooling it would ship the whole file. It
// stays the Savoir-faire slot default, where SlotImage optimises it.
const FALLBACK_KEYS: string[] = [
  SITE_MEDIA.savoirFaire.mobilier,
  SITE_MEDIA.savoirFaire.decoupeLaser,
  SITE_MEDIA.savoirFaire.soudure,
  SITE_MEDIA.savoirFaire.polissage,
  SITE_MEDIA.mobilierPlanTravail,
]

/** Stable per-seed index, so a slot always gets the SAME photo across renders
 *  (a changing one would flicker, and would break SSR/client hydration).
 *  There are far more seeds than photos, so two slots CAN land on the same
 *  picture — accepted, per the duplicates note above. */
function seedIndex(seed: string, len: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h % len
}

export function imageUrl(ref: ImageRef, w: number, h: number): string {
  const folder = folderForSeed(ref.seed)
  if (folder) {
    const key = KEY_BY_STEM.get(`${folder}/${ref.seed}`)
    if (key) return mediaUrl(key)
  }
  // Kept as an explicit escape hatch: `picsum()` is still exported for anyone
  // who genuinely wants a neutral grey placeholder.
  if (FALLBACK_KEYS.length === 0) return picsum(ref.seed, w, h, ref.grayscale)
  return mediaUrl(FALLBACK_KEYS[seedIndex(ref.seed, FALLBACK_KEYS.length)])
}
