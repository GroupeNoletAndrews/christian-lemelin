import { PrismaClient } from "@prisma/client"

// Single shared PrismaClient. On Vercel serverless each instance keeps its own
// client; in dev we cache it on globalThis so Next's hot reload doesn't open a
// new connection pool on every edit. Never `new PrismaClient()` per request.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
