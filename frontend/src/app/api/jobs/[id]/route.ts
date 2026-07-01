import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/prisma"
import { requireAdmin } from "@/lib/server/auth"
import { AppError, errorResponse, noContent, readJson } from "@/lib/server/http"
import { JobSchema, parseBody } from "@/lib/server/validation"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const dto = parseBody(JobSchema, await readJson(req))
    const existing = await prisma.job.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, "Emploi introuvable")
    const job = await prisma.job.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        type: dto.type,
        department: dto.department,
        salary: dto.salary ?? null,
      },
    })
    return NextResponse.json(job)
  } catch (err) {
    return errorResponse(err)
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const existing = await prisma.job.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, "Emploi introuvable")
    await prisma.job.delete({ where: { id } })
    return noContent()
  } catch (err) {
    return errorResponse(err)
  }
}
