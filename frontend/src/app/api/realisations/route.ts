import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse, readJson } from "@/lib/server/http"
import { RealisationSchema, parseBody } from "@/lib/server/validation"
import { createRealisation, listRealisations } from "@/lib/server/realisations"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // Admin preview (?preview): the content workspace edits réalisations with a
  // real-page preview; staged (un-published) edits are overlaid client-side via
  // postMessage, so this just returns the fresh live list with no-store caching
  // (admin-gated) so the workspace always re-reads current data after a publish.
  if (new URL(req.url).searchParams.has("preview")) {
    try {
      await requireAdmin()
      const preview = await listRealisations()
      return NextResponse.json(preview, {
        headers: { "Cache-Control": "no-store" },
      })
    } catch {
      /* not an admin — fall through to the public list */
    }
  }

  const realisations = await listRealisations()
  return NextResponse.json(realisations)
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const dto = parseBody(RealisationSchema, await readJson(req))
    const created = await createRealisation(dto)
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    return errorResponse(err)
  }
}
