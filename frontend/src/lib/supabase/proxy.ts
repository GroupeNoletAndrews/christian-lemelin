import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { User } from "@supabase/supabase-js"

// Refresh the Supabase session for an incoming request and return both the
// (possibly cookie-updated) response and the authenticated user. Mirrors the
// official @supabase/ssr middleware pattern — the returned response carries any
// rotated auth cookies, so it MUST be the one sent back (or have its cookies
// copied) to keep the browser and server in sync.
export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; user: User | null }> {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { response, user: null }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // getUser() validates the token against the Auth server (and refreshes via the
  // rotating refresh token when expired) — don't trust getSession() here.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user }
}
