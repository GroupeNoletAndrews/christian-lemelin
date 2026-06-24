import type { NextResponse } from "next/server"

/** Name of the httpOnly admin session cookie (replaces the old in-memory Bearer token). */
export const COOKIE_NAME = "admin_token"

// Keep in sync with JWT_EXPIRES_IN (7d default).
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7

const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(COOKIE_NAME, token, { ...baseOptions, maxAge: MAX_AGE_SECONDS })
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, "", { ...baseOptions, maxAge: 0 })
}
