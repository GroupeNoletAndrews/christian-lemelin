import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "node:crypto"

export const runtime = "nodejs"

/**
 * Receives Resend delivery events (email.sent / delivered / bounced / opened …).
 * The raw body is load-bearing: the Svix signature is an HMAC over the exact
 * bytes, so we read req.text() and never JSON.parse before verifying.
 *
 * When RESEND_WEBHOOK_SECRET is unset, verification is skipped (dev/testing).
 */
export async function POST(req: NextRequest) {
  const raw = await req.text()

  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim()
  if (secret) {
    try {
      verifySignature(
        secret,
        raw,
        req.headers.get("svix-id"),
        req.headers.get("svix-timestamp"),
        req.headers.get("svix-signature"),
      )
    } catch (err) {
      console.warn(`Rejected a Resend webhook: ${String(err)}`)
      return NextResponse.json(
        { message: "Invalid webhook signature" },
        { status: 401 },
      )
    }
  }

  try {
    const event = JSON.parse(raw) as {
      type?: string
      data?: { email_id?: string; subject?: string }
    }
    console.log(
      `Resend event "${event.type ?? "unknown"}" — id=${
        event.data?.email_id ?? "?"
      } subject="${event.data?.subject ?? ""}"`,
    )
  } catch {
    console.warn("Received a Resend webhook with an unparseable body.")
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

/** Svix signature verification (the scheme Resend uses for webhooks). */
function verifySignature(
  secret: string,
  payload: string,
  id: string | null,
  timestamp: string | null,
  signatureHeader: string | null,
): void {
  if (!id || !timestamp || !signatureHeader) {
    throw new Error("Missing Svix signature headers")
  }

  // Secret is "whsec_<base64>"; the key is the base64-decoded remainder.
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64")
  const signedContent = `${id}.${timestamp}.${payload}`
  const expected = createHmac("sha256", key).update(signedContent).digest("base64")

  // Header is a space-delimited list of "v1,<signature>" entries.
  const provided = signatureHeader
    .split(" ")
    .map((part) => part.split(",")[1])
    .filter(Boolean)

  const expectedBuf = Buffer.from(expected)
  const match = provided.some((sig) => {
    const sigBuf = Buffer.from(sig)
    return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf)
  })

  if (!match) throw new Error("Invalid webhook signature")
}
