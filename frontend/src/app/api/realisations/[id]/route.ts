import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse, noContent, readJson } from "@/lib/server/http"
import { RealisationSchema, parseBody } from "@/lib/server/validation"
import { deleteRealisation, updateRealisation } from "@/lib/server/realisations"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const dto = parseBody(RealisationSchema, await readJson(req))
    const updated = await updateRealisation(id, dto)
    return NextResponse.json(updated)
  } catch (err) {
    return errorResponse(err)
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    await deleteRealisation(id)
    return noContent()
  } catch (err) {
    return errorResponse(err)
  }
}
