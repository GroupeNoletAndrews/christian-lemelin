import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/prisma"
import { errorResponse, readJson } from "@/lib/server/http"
import { ContactSchema, parseBody } from "@/lib/server/validation"
import { sendContactNotification } from "@/lib/server/mail/mail"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const dto = parseBody(ContactSchema, await readJson(req))
    const created = await prisma.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone ?? null,
        message: dto.message,
      },
      select: { id: true },
    })

    // Best-effort notification — never let an email failure break the submission.
    await sendContactNotification({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      message: dto.message,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    return errorResponse(err)
  }
}
