import { NextRequest, NextResponse } from "next/server"
import { errorResponse, readJson } from "@/lib/server/http"
import { UploadUrlSchema, parseBody } from "@/lib/server/validation"
import { createCvUploadUrl } from "@/lib/server/storage"

export const runtime = "nodejs"

// Public — applicants need it to upload a CV. Returns a signed upload URL so the
// file goes DIRECT to Supabase Storage, bypassing Vercel's 4.5MB function cap.
export async function POST(req: NextRequest) {
  try {
    const { filename } = parseBody(UploadUrlSchema, await readJson(req))
    const upload = await createCvUploadUrl(filename)
    return NextResponse.json(upload)
  } catch (err) {
    return errorResponse(err)
  }
}
