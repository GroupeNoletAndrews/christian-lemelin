import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import type { NextRequest } from "next/server"
import { AppError } from "./http"
import { COOKIE_NAME } from "./cookies"

const ALG = "HS256"

function secretKey(): Uint8Array {
  // `||` (not `??`) so an empty-string env var falls back too — an empty key
  // makes jose throw "Zero-length key is not supported".
  const secret = process.env.JWT_SECRET || "dev-secret-change-me"
  return new TextEncoder().encode(secret)
}

export interface AdminClaims extends JWTPayload {
  sub: string
  username: string
}

/** Issue an admin JWT (HS256). Payload shape matches the old @nestjs/jwt token. */
export async function signToken(claims: {
  sub: string
  username: string
}): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "7d")
    .sign(secretKey())
}

/** Verify a token; throws on invalid/expired (caller maps to 401). */
export async function verifyToken(token: string): Promise<AdminClaims> {
  const { payload } = await jwtVerify(token, secretKey(), { algorithms: [ALG] })
  return payload as AdminClaims
}

/**
 * The real authorization boundary — call at the top of every protected route
 * handler. Reads the httpOnly cookie, verifies it, and throws AppError(401)
 * (→ `{message}` 401, same contract the old JwtAuthGuard produced).
 */
export async function requireAdmin(req: NextRequest): Promise<AdminClaims> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) throw new AppError(401, "Non autorisé")
  try {
    return await verifyToken(token)
  } catch {
    throw new AppError(401, "Non autorisé")
  }
}
