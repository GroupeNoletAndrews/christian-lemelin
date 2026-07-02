import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse, readJson } from "@/lib/server/http"
import { getSiteSettings, setSiteSettings } from "@/lib/server/site-settings"
import { SETTING_KEYS } from "@/lib/layouts"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const KEYS = Object.values(SETTING_KEYS)

// Admin only — read/write the small site-settings (layout choices).
export async function GET() {
  try {
    await requireAdmin()
    const settings = await getSiteSettings(KEYS)
    return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = (await readJson(req)) as Record<string, unknown>
    const entries: Record<string, string> = {}
    for (const k of KEYS) {
      if (typeof body?.[k] === "string") entries[k] = body[k] as string
    }
    await setSiteSettings(entries)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
