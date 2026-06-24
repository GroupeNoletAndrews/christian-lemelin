import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse, readJson } from "@/lib/server/http"
import { ReorderSchema, parseBody } from "@/lib/server/validation"
import { reorderRealisations } from "@/lib/server/realisations"

export const runtime = "nodejs"

// A distinct static segment — Next matches /reorder before the dynamic [id],
// so it can never be shadowed by /realisations/:id.
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { ids } = parseBody(ReorderSchema, await readJson(req))
    const result = await reorderRealisations(ids)
    return NextResponse.json(result)
  } catch (err) {
    return errorResponse(err)
  }
}
