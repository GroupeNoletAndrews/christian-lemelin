import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { AppError } from "./http"

// Buckets (create them in the Supabase dashboard):
//   - "cvs"    PRIVATE  — job-application CVs (downloaded server-side for email)
//   - "images" PUBLIC   — réalisation images (served by public URL)
export const CV_BUCKET = "cvs"
export const IMAGE_BUCKET = "images"

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

export interface ImageUpload extends SignedUpload {
  publicUrl: string
}

/** Signed URL + final public URL for a réalisation image in the public bucket. */
export async function createImageUploadUrl(filename: string): Promise<ImageUpload> {
  const client = getStorageClient()
  if (!client) throw new AppError(503, "Le stockage des fichiers n'est pas configuré")
  const { data, error } = await client.storage
    .from(IMAGE_BUCKET)
    .createSignedUploadUrl(makeKey(filename))
  if (error || !data) {
    throw new AppError(502, "Impossible de créer l'URL de téléversement")
  }
  const { data: pub } = client.storage.from(IMAGE_BUCKET).getPublicUrl(data.path)
  return {
    bucket: IMAGE_BUCKET,
    path: data.path,
    token: data.token,
    publicUrl: pub.publicUrl,
  }
}
