import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Browser Supabase client (publishable key — safe to expose). Only used to PUT
// files to signed upload URLs issued by the server; no session is persisted.
let client: SupabaseClient | null = null

function browserSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error("Supabase n'est pas configuré (NEXT_PUBLIC_SUPABASE_*).")
    }
    client = createClient(url, key, { auth: { persistSession: false } })
  }
  return client
}

/** Upload a file/blob to a signed upload URL (issued by an /api/.../upload-url route). */
export async function uploadToBucket(
  bucket: string,
  path: string,
  token: string,
  body: Blob | File,
  options?: { cacheControl?: string },
): Promise<void> {
  const { error } = await browserSupabase()
    .storage.from(bucket)
    .uploadToSignedUrl(path, token, body, options)
  if (error) throw error
}
