import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse, readJson } from "@/lib/server/http"
import { RealisationSchema, parseBody } from "@/lib/server/validation"
import { createRealisation, listRealisations } from "@/lib/server/realisations"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
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
