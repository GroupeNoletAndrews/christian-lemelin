import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { SupabaseClient } from "@supabase/supabase-js"

// Server-side Supabase client bound to the request's cookies (Next's
// next/headers store). Reads the session set by the browser client; when the
// access token is stale, getUser()/getClaims() refresh it and write the new
// cookies back. The setAll try/catch is required because Server Components get a
// read-only cookie store — the refresh then happens in proxy.ts instead.
export async function supabaseServer(): Promise<SupabaseClient> {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error("Supabase n'est pas configuré (NEXT_PUBLIC_SUPABASE_*).")
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Called from a Server Component (read-only cookies) — ignore; the
          // proxy refreshes the session on the next request.
        }
      },
    },
  })
}
