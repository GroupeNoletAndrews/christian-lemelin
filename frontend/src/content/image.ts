import type { ImageRef } from "./types"
import { mediaUrl, MEDIA_FOLDERS } from "@/lib/media"
import { MEDIA_MANIFEST } from "./media-manifest"

// Site content images resolve to a real photo in Supabase Storage when one has
// been uploaded to the matching section folder of the `christian-alain` bucket;
// otherwise they fall back to a picsum placeholder. This allows a gradual,
// section-by-section migration with zero breakage:
//
//   1. Add a photo named "<seed>.<ext>" (e.g. ecl-about-atelier-large.jpg)
//      under photos/<section>/ in the bucket (Supabase Studio upload, or drop
//      it in frontend/public and wire it into the sync script).
//   2. Run `npm run media:sync` (re-lists the bucket → regenerates the manifest).
//   3. imageUrl() now returns the Supabase URL for that seed; everything else
//      stays on picsum until photographed.

const BASE = "https://picsum.photos/seed"

export function picsum(seed: string, w: number, h: number, grayscale = false): string {
  return `${BASE}/${seed}/${w}/${h}${grayscale ? "?grayscale" : ""}`
}

// Which christian-alain folder a content image belongs to, keyed by seed prefix.
// The prod bucket only has these photo folders, so materials + installations map
// into existing ones. Adjust here if you reorganise. Seeds with no rule always
// stay on picsum.
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

export function imageUrl(ref: ImageRef, w: number, h: number): string {
  const folder = folderForSeed(ref.seed)
  if (folder) {
    const key = KEY_BY_STEM.get(`${folder}/${ref.seed}`)
    if (key) return mediaUrl(key)
  }
  return picsum(ref.seed, w, h, ref.grayscale)
}
