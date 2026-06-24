import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/prisma"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse, readJson } from "@/lib/server/http"
import { JobSchema, parseBody } from "@/lib/server/validation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(jobs)
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const dto = parseBody(JobSchema, await readJson(req))
    const job = await prisma.job.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        type: dto.type,
        department: dto.department,
        salary: dto.salary ?? null,
      },
    })
    return NextResponse.json(job, { status: 201 })
  } catch (err) {
    return errorResponse(err)
  }
}
