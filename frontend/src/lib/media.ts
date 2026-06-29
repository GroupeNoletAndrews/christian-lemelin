// Shared media helpers for Supabase Storage. Safe to import from BOTH client
// and server code (no secrets here). All site photos & videos live in a single
// PUBLIC bucket "christian-alain" that mirrors the prod organisation:
//
//   christian-alain/
//     photos/{a-propos, fabrication, logo, realisations, solutions}/
//     videos/
//
// CVs are sensitive and stay in a SEPARATE private "cvs" bucket
// (see src/lib/server/storage.ts).

/** Public bucket holding every site photo & video (mirrors prod). */
export const MEDIA_BUCKET = "christian-alain"

/** Folder prefixes inside MEDIA_BUCKET. */
export const MEDIA_FOLDERS = {
  aPropos: "photos/a-propos",
  fabrication: "photos/fabrication",
  logo: "photos/logo",
  realisations: "photos/realisations",
  solutions: "photos/solutions",
  videos: "videos",
} as const

/** Base URL of the Supabase project for the CURRENT environment (no trailing slash). */
function supabaseBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ""
  return raw.replace(/\/+$/, "")
}

/**
 * Resolve a storage object key (a path inside MEDIA_BUCKET, e.g.
 * "photos/realisations/bar-lounge-1.jpg") to a public URL for the current
 * environment — so dev shows dev images and prod shows prod images.
 *
 * Values that are already absolute URLs (http…) or local paths ("/…") are
 * returned untouched, so legacy rows and any remaining /public assets keep
 * working during/after the migration.
 */
export function mediaUrl(keyOrUrl: string): string {
  if (!keyOrUrl) return ""
  // Pass through absolute URLs, local paths, and in-browser staged previews
  // (data:/blob: URLs used by the content workspace before an upload happens).
  if (/^(https?:|data:|blob:)/i.test(keyOrUrl) || keyOrUrl.startsWith("/")) return keyOrUrl
  const base = supabaseBaseUrl()
  return base
    ? `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${keyOrUrl}`
    : `/${keyOrUrl}`
}

/**
 * Next/Image's optimizer refuses to fetch from a private IP (SSRF guard), so it
 * can't optimise images served by the LOCAL Supabase stack (127.0.0.1). Pass
 * this as <Image unoptimized={…}> for Supabase-served media: true only against
 * a local/private host, so prod (public *.supabase.co) keeps optimisation.
 */
export const MEDIA_UNOPTIMIZED = /\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0)(:|\/|$)/.test(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
)

/**
 * mediaUrl + a cache-busting version query so an in-place overwrite (same storage
 * key) is shown fresh instead of the previously-rendered image. Pass-through
 * values (data:/blob:/http/local) are returned untouched. `version` is typically
 * a record's updatedAt timestamp, which changes when the image is republished.
 */
export function imgSrc(keyOrUrl: string, version?: string | number): string {
  const url = mediaUrl(keyOrUrl)
  if (version == null || /^(data:|blob:)/i.test(url)) return url
  return `${url}${url.includes("?") ? "&" : "?"}v=${version}`
}

/**
 * Inverse of mediaUrl: given a value stored on a record (a storage key, a full
 * public URL — local or prod, or a legacy "/…" path), return the object key
 * inside MEDIA_BUCKET, or null if it doesn't live in the bucket (so callers can
 * safely skip /public assets and foreign URLs when cleaning up storage).
 */
export function mediaKeyOf(value: string): string | null {
  if (!value) return null
  const marker = `/object/public/${MEDIA_BUCKET}/`
  const at = value.indexOf(marker)
  if (at !== -1) return value.slice(at + marker.length) || null // full public URL
  if (/^https?:\/\//i.test(value) || value.startsWith("/")) return null // other URL / local path
  return value // already a bucket key
}

/** kebab-case, accent-stripped, ascii slug from a project name. */
export function slugify(input: string): string {
  const slug = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "realisation"
}

/**
 * Storage key for a réalisation image — EACH RÉALISATION GETS ITS OWN FOLDER,
 * named after the project slug, with a 1-based picture number inside:
 *   photos/realisations/<project-slug>/<n>.<ext>
 * e.g. realisationImageKey("Bar lounge — hôtellerie", 2) →
 *      "photos/realisations/bar-lounge-hotellerie/2.jpg"
 */
export function realisationImageKey(
  projectName: string,
  index: number,
  ext = "jpg",
): string {
  const clean = ext.replace(/^\.+/, "").toLowerCase() || "jpg"
  return `${MEDIA_FOLDERS.realisations}/${slugify(projectName)}/${index}.${clean}`
}

/**
 * The trailing picture number of a réalisation image key/URL
 * (…/<slug>-<n>.<ext>), or 0 if there isn't one (legacy/foreign values). Used
 * to number new uploads from the highest existing one, so deletions never cause
 * a number to be reused (which would overwrite an existing photo).
 */
export function realisationImageIndex(keyOrUrl: string): number {
  // Matches the trailing number whether the separator is "-" (legacy flat keys)
  // or "/" (per-réalisation folder keys: …/<slug>/<n>.<ext>).
  const m = /[-/](\d+)\.[^./]+$/.exec(keyOrUrl)
  return m ? parseInt(m[1], 10) : 0
}

/** Known static site assets (uploaded to MEDIA_BUCKET; resolve with mediaUrl). */
export const SITE_MEDIA = {
  logo: `${MEDIA_FOLDERS.logo}/logo_eclemelin.png`,
  heroVideo: `${MEDIA_FOLDERS.videos}/videoLemelin.mp4`,
  savoirFaire: {
    mobilier: `${MEDIA_FOLDERS.fabrication}/savoir-faire-mobilier-hospitalier.jpg`,
    fabrication: `${MEDIA_FOLDERS.fabrication}/savoir-faire-fabrication.jpg`,
    decoupeLaser: `${MEDIA_FOLDERS.fabrication}/savoir-faire-decoupe-laser.jpg`,
    soudure: `${MEDIA_FOLDERS.fabrication}/savoir-faire-soudure.jpg`,
    polissage: `${MEDIA_FOLDERS.fabrication}/savoir-faire-polissage.jpg`,
  },
} as const
