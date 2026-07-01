import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { AppError } from "./http"
import { MEDIA_BUCKET, realisationImageKey, mediaKeyOf } from "@/lib/media"

// Buckets:
//   - "cvs"            PRIVATE  — job-application CVs (downloaded server-side)
//   - MEDIA_BUCKET     PUBLIC   — all site photos & videos (incl. réalisations,
//                                 under photos/realisations/) — served by URL
export const CV_BUCKET = "cvs"

let cached: SupabaseClient | null | undefined

/** Service-role Supabase client, server-only. Never import this from a client component. */
function getStorageClient(): SupabaseClient | null {
  if (cached === undefined) {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    const key =
      process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    if (url && key) {
      cached = createClient(url, key, { auth: { persistSession: false } })
    } else {
      cached = null
      console.warn(
        "Supabase storage is not configured (SUPABASE_URL / SUPABASE_SECRET_KEY missing).",
      )
    }
  }
  return cached
}

function sanitize(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_")
}

function makeKey(filename: string): string {
  return `${Date.now()}-${sanitize(filename)}`
}

function extOf(filename: string): string {
  const m = /\.([a-zA-Z0-9]+)$/.exec(filename)
  return m ? m[1].toLowerCase() : "jpg"
}

export interface SignedUpload {
  bucket: string
  path: string
  token: string
}

/** Signed URL the browser uses to PUT a CV directly to the private bucket. */
export async function createCvUploadUrl(filename: string): Promise<SignedUpload> {
  const client = getStorageClient()
  if (!client) throw new AppError(503, "Le stockage des fichiers n'est pas configuré")
  const { data, error } = await client.storage
    .from(CV_BUCKET)
    .createSignedUploadUrl(makeKey(filename))
  if (error || !data) {
    throw new AppError(502, "Impossible de créer l'URL de téléversement")
  }
  return { bucket: CV_BUCKET, path: data.path, token: data.token }
}

/** Fetch CV bytes from the private bucket for an email attachment (best-effort). */
export async function downloadCv(key: string): Promise<Buffer | null> {
  const client = getStorageClient()
  if (!client) return null
  const { data, error } = await client.storage.from(CV_BUCKET).download(key)
  if (error || !data) return null
  return Buffer.from(await data.arrayBuffer())
}

/**
 * Signed URL for a réalisation image in the public bucket. The object key is
 * named after the project + a 1-based picture number
 * (photos/realisations/<slug>-<index>.<ext>); the browser PUTs the compressed
 * JPEG to it. `path` (the storage key) is what gets persisted on the
 * réalisation — resolve it to a URL with mediaUrl() at render time.
 */
export async function createImageUploadUrl(
  projectName: string,
  index: number,
  filename: string,
): Promise<SignedUpload> {
  const client = getStorageClient()
  if (!client) throw new AppError(503, "Le stockage des fichiers n'est pas configuré")
  const key = realisationImageKey(projectName, index, extOf(filename))
  const { data, error } = await client.storage
    .from(MEDIA_BUCKET)
    // upsert: deterministic names mean re-uploading the same picture overwrites.
    .createSignedUploadUrl(key, { upsert: true })
  if (error || !data) {
    throw new AppError(502, "Impossible de créer l'URL de téléversement")
  }
  return { bucket: MEDIA_BUCKET, path: data.path, token: data.token }
}

/**
 * Signed URL to upload to an EXACT object key in the public bucket (content
 * editing — overwrite in place, same name). The key must live under photos/ so
 * an admin can't write elsewhere in the bucket. upsert overwrites the existing
 * object so the published image keeps its filename.
 */
export async function createImageUploadUrlForKey(key: string): Promise<SignedUpload> {
  const client = getStorageClient()
  if (!client) throw new AppError(503, "Le stockage des fichiers n'est pas configuré")
  if (!key.startsWith("photos/")) throw new AppError(400, "Clé d'image invalide")
  const { data, error } = await client.storage
    .from(MEDIA_BUCKET)
    .createSignedUploadUrl(key, { upsert: true })
  if (error || !data) {
    throw new AppError(502, "Impossible de créer l'URL de téléversement")
  }
  return { bucket: MEDIA_BUCKET, path: data.path, token: data.token }
}

// ===========================================================================
// Storage usage (admin meter) — recursively list a bucket and sum object sizes.
// Supabase's list() returns files with metadata.size and folders as entries
// whose id is null; we recurse into folders and page through large listings.
// ===========================================================================

export interface BucketUsage {
  name: string
  bytes: number
  objects: number
}

async function bucketUsage(client: SupabaseClient, bucket: string): Promise<BucketUsage> {
  let bytes = 0
  let objects = 0
  const PAGE = 1000
  const walk = async (prefix: string): Promise<void> => {
    let offset = 0
    for (;;) {
      const { data, error } = await client.storage.from(bucket).list(prefix, {
        limit: PAGE,
        offset,
        sortBy: { column: "name", order: "asc" },
      })
      if (error || !data || data.length === 0) break
      for (const entry of data) {
        const path = prefix ? `${prefix}/${entry.name}` : entry.name
        // Folders come back with a null id; recurse into them.
        if (entry.id === null) {
          await walk(path)
          continue
        }
        // Skip Supabase's empty-folder placeholder objects (0 bytes, noise).
        if (entry.name === ".emptyFolderPlaceholder") continue
        const size = (entry.metadata?.size as number | undefined) ?? 0
        bytes += size
        objects += 1
      }
      if (data.length < PAGE) break
      offset += PAGE
    }
  }
  await walk("")
  return { name: bucket, bytes, objects }
}

export interface StorageUsage {
  buckets: BucketUsage[]
  totalBytes: number
  totalObjects: number
  /** Soft cap in bytes (env STORAGE_SOFT_LIMIT_GB, default 1 GB), or null if disabled. */
  limitBytes: number | null
}

/** Aggregate size + object count across the media and CV buckets, for the admin meter. */
export async function getStorageUsage(): Promise<StorageUsage> {
  const client = getStorageClient()
  if (!client) throw new AppError(503, "Le stockage n'est pas configuré")
  const buckets = await Promise.all(
    [MEDIA_BUCKET, CV_BUCKET].map((name) => bucketUsage(client, name)),
  )
  const totalBytes = buckets.reduce((s, b) => s + b.bytes, 0)
  const totalObjects = buckets.reduce((s, b) => s + b.objects, 0)
  const gb = Number(process.env.STORAGE_SOFT_LIMIT_GB ?? "1")
  const limitBytes = Number.isFinite(gb) && gb > 0 ? gb * 1024 ** 3 : null
  return { buckets, totalBytes, totalObjects, limitBytes }
}

/**
 * Best-effort: remove media objects from the public bucket (e.g. when a
 * réalisation or one of its photos is deleted). Accepts stored values — keys or
 * full public URLs — and skips anything not in the bucket (legacy /public
 * paths). Never throws: a storage hiccup must not block the DB operation.
 */
export async function deleteMediaObjects(values: string[]): Promise<void> {
  const client = getStorageClient()
  if (!client) return
  const keys = values
    .map(mediaKeyOf)
    .filter((k): k is string => k !== null)
  if (keys.length === 0) return
  const { error } = await client.storage.from(MEDIA_BUCKET).remove(keys)
  if (error) {
    console.warn(`Storage cleanup failed (${keys.join(", ")}): ${error.message}`)
  }
}
