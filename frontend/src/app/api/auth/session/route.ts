import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse } from "@/lib/server/http"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Returns the current admin session (the cookie is httpOnly, so the client can't
// read it directly — it calls this on mount to restore auth state after refresh).
export async function GET(req: NextRequest) {
  try {
    const claims = await requireAdmin(req)
    return NextResponse.json({ username: claims.username })
  } catch (err) {
    return errorResponse(err)
  }
}
