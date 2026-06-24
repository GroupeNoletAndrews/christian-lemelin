import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/server/auth"
import { COOKIE_NAME } from "@/lib/server/cookies"

// Next 16 renamed `middleware.ts` -> `proxy.ts` (function `middleware` -> `proxy`).
// Coarse guard for the admin dashboard: redirect to the login page when the
// session cookie is missing/invalid. The real authorization boundary is
// requireAdmin() inside each /api route handler.
export const config = { matcher: ["/admin/dashboard/:path*"] }

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (token) {
    try {
      await verifyToken(token)
      return NextResponse.next()
    } catch {
      /* invalid/expired — fall through to redirect */
    }
  }
  const url = req.nextUrl.clone()
  url.pathname = "/admin"
  return NextResponse.redirect(url)
}
