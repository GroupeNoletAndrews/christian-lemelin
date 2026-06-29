import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse, readJson } from "@/lib/server/http"
import { SectionPublishSchema, parseBody } from "@/lib/server/validation"
import { publishSectionImages } from "@/lib/server/sections"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ section: string }> }

// Apply staged static-section image overrides (keys already uploaded to storage)
// and revalidate the section's public routes.
export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin()
    const { section } = await ctx.params
    const { changes } = parseBody(SectionPublishSchema, await readJson(req))
    await publishSectionImages(section, changes)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
