import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse } from "@/lib/server/http"
import { togglePinRealisation } from "@/lib/server/realisations"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ id: string }> }

// Toggle pinned; throws 409 when the pin cap is reached (client maps 409 -> alert).
export async function PATCH(_req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const updated = await togglePinRealisation(id)
    return NextResponse.json(updated)
  } catch (err) {
    return errorResponse(err)
  }
}
