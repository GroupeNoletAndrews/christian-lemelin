import { NextResponse } from "next/server"

/**
 * Error with an HTTP status, mirroring the Nest exceptions the old API threw
 * (UnauthorizedException -> 401, NotFoundException -> 404, ConflictException ->
 * 409). The frontend client reads `body.message`, so error bodies are `{message}`.
 */
export class AppError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "AppError"
  }
}

/** Map a thrown error to a JSON `{message}` response (500 for anything unexpected). */
export function errorResponse(err: unknown): NextResponse {
  if (err instanceof AppError) {
    return NextResponse.json({ message: err.message }, { status: err.status })
  }
  console.error("Unhandled API error:", err)
  return NextResponse.json(
    { message: "Erreur interne du serveur" },
    { status: 500 },
  )
}

/** Parse a JSON request body, throwing AppError(400) on malformed JSON. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json()
  } catch {
    throw new AppError(400, "Corps de requête JSON invalide")
  }
}

/** 204 No Content (matches the old DELETE behaviour the frontend expects). */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}
