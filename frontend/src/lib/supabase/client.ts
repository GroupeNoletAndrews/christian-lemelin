import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// Browser-side Supabase Auth client. @supabase/ssr stores the session in
// cookies (not localStorage) so the server can read it, and auto-refreshes the
// access token. Used by the admin context for signInWithPassword / signOut /
// getUser. (Storage uploads use a separate client — see ./../supabase-browser.ts.)
let client: SupabaseClient | null = null

export function supabaseBrowser(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error("Supabase n'est pas configuré (NEXT_PUBLIC_SUPABASE_*).")
    }
    client = createBrowserClient(url, key)
  }
  return client
}
