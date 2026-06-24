import { Resend } from "resend"
import {
  EmailField,
  formatTimestamp,
  linkField,
  renderEmail,
  renderText,
  textField,
} from "./email-templates"

/**
 * Form-notification emails to the company via Resend.
 *
 * Env-driven (no NODE_ENV branching). Defaults are dev-safe Resend test
 * addresses, so a local stack only needs RESEND_API_KEY to start sending:
 *   - MAIL_FROM  dev: "… <onboarding@resend.dev>"; prod: a verified-domain address.
 *   - MAIL_TO    dev: "delivered@resend.dev"; prod: the real company address.
 *
 * Sending is best-effort: failures are logged but never thrown, so a Resend
 * outage can't break a form submission (the data is already persisted).
 */

let cachedResend: Resend | null | undefined
function getResend(): Resend | null {
  if (cachedResend === undefined) {
    const apiKey = process.env.RESEND_API_KEY?.trim()
    if (apiKey) {
      cachedResend = new Resend(apiKey)
    } else {
      cachedResend = null
      console.warn(
        "RESEND_API_KEY is not set — form notification emails are disabled.",
      )
    }
  }
  return cachedResend
}

const mailFrom = () =>
  process.env.MAIL_FROM?.trim() ||
  "Entreprises Christian Lemelin <onboarding@resend.dev>"
const mailTo = () => process.env.MAIL_TO?.trim() || "delivered@resend.dev"

export interface ContactNotification {
  name: string
  email: string
  phone?: string | null
  message: string
}

export interface ApplicationNotification {
  name: string
  email: string
  phone?: string | null
  message?: string | null
  jobTitle?: string | null
  /** Already-fetched CV bytes (downloaded from storage by the caller). */
  cv?: { filename: string; content: Buffer } | null
  /** True when a CV was uploaded but its bytes couldn't be fetched for attaching. */
  cvFailed?: boolean
}

export async function sendContactNotification(
  input: ContactNotification,
): Promise<void> {
  const fields: EmailField[] = [
    textField("Nom", input.name),
    linkField("Courriel", input.email, `mailto:${input.email}`),
  ]
  if (input.phone) {
    fields.push(
      linkField("Téléphone", input.phone, `tel:${input.phone.replace(/[^\d+]/g, "")}`),
    )
  }

  const footerNote = `Reçu via le formulaire « Nous joindre » du site — ${formatTimestamp(new Date())}`
  const html = renderEmail({
    preheader: `Nouvelle demande de ${input.name}`,
    eyebrow: "Nouvelle demande de contact",
    title: "Un visiteur souhaite vous joindre",
    intro:
      "Une nouvelle demande a été envoyée depuis le formulaire de contact du site web.",
    fields,
    messageLabel: "Son projet",
    messageBody: input.message,
    action: { label: `Répondre à ${input.name}`, href: `mailto:${input.email}` },
    footerNote,
  })
  const text = renderText({
    eyebrow: "Nouvelle demande de contact",
    title: "Un visiteur souhaite vous joindre",
    fields,
    messageLabel: "Son projet",
    messageBody: input.message,
    footerNote,
  })

  await send({
    subject: `Nouvelle demande de contact — ${input.name}`,
    html,
    text,
    replyTo: input.email,
  })
}

export async function sendApplicationNotification(
  input: ApplicationNotification,
): Promise<void> {
  const fields: EmailField[] = [
    textField("Candidat", input.name),
    linkField("Courriel", input.email, `mailto:${input.email}`),
  ]
  if (input.phone) {
    fields.push(
      linkField("Téléphone", input.phone, `tel:${input.phone.replace(/[^\d+]/g, "")}`),
    )
  }
  if (input.jobTitle) {
    fields.push(textField("Poste visé", input.jobTitle))
  }

  let attachments: { filename: string; content: Buffer }[] | undefined
  let note: string | undefined
  if (input.cv) {
    attachments = [{ filename: input.cv.filename, content: input.cv.content }]
    note = `📎 CV joint : ${input.cv.filename}`
  } else if (input.cvFailed) {
    note = "Un CV a été téléversé mais n’a pas pu être joint à ce courriel."
  }

  const jobSuffix = input.jobTitle ? ` · ${input.jobTitle}` : ""
  const footerNote = `Reçu via le formulaire de candidature du site — ${formatTimestamp(new Date())}`
  const html = renderEmail({
    preheader: `Candidature de ${input.name}${jobSuffix}`,
    eyebrow: "Nouvelle candidature",
    title: input.jobTitle
      ? `Candidature — ${input.jobTitle}`
      : "Nouvelle candidature spontanée",
    intro:
      "Une nouvelle candidature a été soumise depuis la section emplois du site web.",
    fields,
    messageLabel: input.message ? "Message du candidat" : undefined,
    messageBody: input.message ?? undefined,
    note,
    action: { label: `Répondre à ${input.name}`, href: `mailto:${input.email}` },
    footerNote,
  })
  const text = renderText({
    eyebrow: "Nouvelle candidature",
    title: input.jobTitle
      ? `Candidature — ${input.jobTitle}`
      : "Nouvelle candidature spontanée",
    fields,
    messageLabel: input.message ? "Message du candidat" : undefined,
    messageBody: input.message ?? undefined,
    note,
    footerNote,
  })

  await send({
    subject: `Nouvelle candidature — ${input.name}${jobSuffix}`,
    html,
    text,
    replyTo: input.email,
    attachments,
  })
}

/** Single send path — swallows errors so a form submission never fails on email. */
async function send(payload: {
  subject: string
  html: string
  text: string
  replyTo: string
  attachments?: { filename: string; content: Buffer }[]
}): Promise<void> {
  const resend = getResend()
  if (!resend) return // disabled (no API key)
  try {
    const { data, error } = await resend.emails.send({
      from: mailFrom(),
      to: mailTo(),
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo,
      attachments: payload.attachments,
    })
    if (error) {
      console.error(`Resend rejected the email: ${JSON.stringify(error)}`)
      return
    }
    console.log(`Notification email sent (id: ${data?.id ?? "unknown"})`)
  } catch (err) {
    console.error(`Failed to send notification email: ${String(err)}`)
  }
}
