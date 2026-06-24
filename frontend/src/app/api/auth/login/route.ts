import { NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/server/prisma"
import { signToken } from "@/lib/server/auth"
import { setSessionCookie } from "@/lib/server/cookies"
import { AppError, errorResponse, readJson } from "@/lib/server/http"
import { LoginSchema, parseBody } from "@/lib/server/validation"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  
  try {
    const { username, password } = parseBody(LoginSchema, await readJson(req))
    const admin = await prisma.adminUser.findUnique({ where: { username } })
    // Compare even when the user is missing to avoid leaking which failed.
    const ok = admin ? await compare(password, admin.passwordHash) : false
    if (!admin || !ok) throw new AppError(401, "Identifiants invalides")

    const token = await signToken({ sub: admin.id, username: admin.username })
    const res = NextResponse.json({ username: admin.username })
    setSessionCookie(res, token)
    return res
  } catch (err) {
    return errorResponse(err)
  }
}
