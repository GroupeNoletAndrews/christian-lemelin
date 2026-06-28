import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"
import { isAllowedAdmin } from "@/lib/auth-allowlist"

// Next 16 renamed `middleware.ts` -> `proxy.ts` (function `middleware` -> `proxy`).
// Runs on /admin/* to (1) refresh the Supabase session cookies and (2) redirect
// to the login page when the dashboard is opened without a valid admin session.
// The real authorization boundary is still requireAdmin() in each /api handler.
export const config = { matcher: ["/admin/:path*"] }

export async function proxy(req: NextRequest) {
  const { response, user } = await updateSession(req)

  const isDashboard = req.nextUrl.pathname.startsWith("/admin/dashboard")
  if (isDashboard && !isAllowedAdmin(user)) {
    const url = req.nextUrl.clone()
    url.pathname = "/admin"
    const redirect = NextResponse.redirect(url)
    // Carry over any auth cookies the session refresh cleared/rotated so the
    // browser drops the stale session instead of looping back.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
  }

  return response
}
