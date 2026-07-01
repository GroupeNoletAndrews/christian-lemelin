import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse } from "@/lib/server/http"
import { getSectionAdminState } from "@/lib/server/sections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ section: string }> }

// Admin only — a static section's slots with their current published key + URL.
// (Static segments like /realisations take precedence over this [section] route.)
export async function GET(_req: Request, ctx: Ctx) {
  try {
    await requireAdmin()
    const { section } = await ctx.params
    const state = await getSectionAdminState(section)
    if (!state) {
      return NextResponse.json({ message: "Section inconnue" }, { status: 404 })
    }
    return NextResponse.json(state, { headers: { "Cache-Control": "no-store" } })
  } catch (err) {
    return errorResponse(err)
  }
}
