import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Liveness probe. Intentionally does NOT touch the DB.
export async function GET() {
  return NextResponse.json({ status: "ok" })
}
