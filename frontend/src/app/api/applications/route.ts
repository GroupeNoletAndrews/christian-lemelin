import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/prisma"
import { requireAdmin } from "@/lib/server/auth"
import { errorResponse, readJson } from "@/lib/server/http"
import { ApplicationSchema, parseBody } from "@/lib/server/validation"
import { downloadCv } from "@/lib/server/storage"
import { sendApplicationNotification } from "@/lib/server/mail/mail"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await requireAdmin()
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(applications)
  } catch (err) {
    return errorResponse(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const dto = parseBody(ApplicationSchema, await readJson(req))

    const created = await prisma.application.create({
      data: {
        jobId: dto.jobId ?? null,
        name: dto.name,
        email: dto.email,
        phone: dto.phone ?? null,
        message: dto.message ?? null,
        cvPath: dto.cvKey ?? null,
      },
      select: { id: true },
    })

    // Resolve the job title (if any) so the email is self-explanatory.
    let jobTitle: string | null = null
    if (dto.jobId) {
      const job = await prisma.job.findUnique({
        where: { id: dto.jobId },
        select: { title: true },
      })
      jobTitle = job?.title ?? null
    }

    // Best-effort: fetch the CV bytes from storage to attach. Never throws.
    let cv: { filename: string; content: Buffer } | null = null
    let cvFailed = false
    if (dto.cvKey) {
      const content = await downloadCv(dto.cvKey)
      if (content) {
        cv = { filename: dto.cvFilename || dto.cvKey, content }
      } else {
        cvFailed = true
      }
    }

    await sendApplicationNotification({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      message: dto.message ?? null,
      jobTitle,
      cv,
      cvFailed,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    return errorResponse(err)
  }
}
