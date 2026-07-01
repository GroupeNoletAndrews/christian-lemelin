import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse } from "@/lib/server/http"
import { getStorageUsage } from "@/lib/server/storage"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Admin only — total Supabase Storage usage (media + CV buckets) for the
// content-workspace space meter. Cached briefly at the edge of the client.
export async function GET() {
  try {
    await requireAdmin()
    const usage = await getStorageUsage()
    return NextResponse.json(usage, {
      headers: { "Cache-Control": "private, max-age=60" },
    })
  } catch (err) {
    return errorResponse(err)
  }
}
