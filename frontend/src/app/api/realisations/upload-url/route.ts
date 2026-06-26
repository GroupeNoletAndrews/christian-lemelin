import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse, readJson } from "@/lib/server/http"
import { ImageUploadUrlSchema, parseBody } from "@/lib/server/validation"
import { createImageUploadUrl } from "@/lib/server/storage"

export const runtime = "nodejs"

// Admin only — returns a signed upload URL for a réalisation image. The object
// is named after the project + picture number (photos/realisations/<slug>-<n>);
// the browser uploads the compressed JPEG direct to storage and persists the
// returned `path` (storage key) on the réalisation.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { projectName, index, filename } = parseBody(
      ImageUploadUrlSchema,
      await readJson(req),
    )
    const upload = await createImageUploadUrl(projectName, index, filename)
    return NextResponse.json(upload)
  } catch (err) {
    return errorResponse(err)
  }
}
