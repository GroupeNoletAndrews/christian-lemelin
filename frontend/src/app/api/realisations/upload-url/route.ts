import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse, readJson } from "@/lib/server/http"
import { UploadUrlSchema, parseBody } from "@/lib/server/validation"
import { createImageUploadUrl } from "@/lib/server/storage"

export const runtime = "nodejs"

// Admin only — returns a signed upload URL + the final public URL for a
// réalisation image. The browser uploads the compressed JPEG direct to storage.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { filename } = parseBody(UploadUrlSchema, await readJson(req))
    const upload = await createImageUploadUrl(filename)
    return NextResponse.json(upload)
  } catch (err) {
    return errorResponse(err)
  }
}
