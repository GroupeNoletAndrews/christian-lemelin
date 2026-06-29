import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse, readJson } from "@/lib/server/http"
import { MediaUploadUrlSchema, parseBody } from "@/lib/server/validation"
import { createImageUploadUrlForKey } from "@/lib/server/storage"

export const runtime = "nodejs"

// Admin only — signed URL to upload to an EXACT storage key (overwrite in place).
// Used by the content workspace so a replacement keeps the same filename.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const { key } = parseBody(MediaUploadUrlSchema, await readJson(req))
    const upload = await createImageUploadUrlForKey(key)
    return NextResponse.json(upload)
  } catch (err) {
    return errorResponse(err)
  }
}
