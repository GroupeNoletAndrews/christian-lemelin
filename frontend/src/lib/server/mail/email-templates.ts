/**
 * Brand-styled HTML emails for form notifications.
 *
 * These mirror the website's OPUS-aligned design system (see DESIGN.md):
 * cream page background, white surface card, hairline borders, neutral near-black
 * text, a single electric-blue accent reserved for the action button. Web fonts
 * aren't reliable in email clients, so we fall back to a system sans/mono stack
 * (Onest / Fragment Mono on the site → closest system equivalents here).
 *
 * Everything is table-based with inline styles — the only layout primitives that
 * render consistently across email clients (Gmail, Outlook, Apple Mail…).
 */

// ── Palette (solid hex approximations of the site tokens, since email clients
// handle rgba-over-background poorly). See globals.css. ──
const C = {
  background: '#f3f3f1', // cream — page background
  surface: '#ffffff', // white — card
  border: '#e4e4e1', // hairline (≈ rgba(151,151,151,.2) flattened)
  foreground: '#141414', // neutral near-black
  muted: '#6b6b6b', // secondary text (≈ rgba(20,20,20,.6))
  accent: '#0048f9', // OPUS electric blue — button only
  ink: '#111111', // dark footer
} as const

const FONT_SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
const FONT_MONO =
  "'SFMono-Regular',ui-monospace,'Fragment Mono',Menlo,Consolas,monospace"

/** Escape user-supplied text before interpolating into HTML. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Convert newlines to <br> for the free-text message block (after escaping). */
function multiline(value: string): string {
  return esc(value).replace(/\r?\n/g, '<br>')
}

export interface EmailField {
  label: string
  /** Pre-escaped/safe HTML value (use the helpers below to build it). */
  value: string
}

/** A plain text value rendered into a field row. */
export function textField(label: string, value: string): EmailField {
  return { label, value: esc(value) }
}

/** A mailto/tel link field row (keeps the accent off text, per DESIGN.md). */
export function linkField(
  label: string,
  display: string,
  href: string,
): EmailField {
  return {
    label,
    value: `<a href="${esc(href)}" style="color:${C.foreground};text-decoration:underline;text-underline-offset:2px;">${esc(
      display,
    )}</a>`,
  }
}

function renderFieldRows(fields: EmailField[]): string {
  return fields
    .map(
      (f) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid ${C.border};vertical-align:top;">
          <p style="margin:0 0 4px;font-family:${FONT_MONO};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${C.muted};">${esc(
            f.label,
          )}</p>
          <p style="margin:0;font-family:${FONT_SANS};font-size:15px;line-height:1.5;color:${C.foreground};">${f.value}</p>
        </td>
      </tr>`,
    )
    .join('')
}

export interface EmailLayoutOptions {
  /** Hidden inbox-preview line. */
  preheader: string
  /** Small mono label above the title (e.g. "Nouvelle demande de contact"). */
  eyebrow: string
  /** Normal-case headline. */
  title: string
  /** Short muted intro sentence. */
  intro: string
  fields: EmailField[]
  /** Optional free-text block rendered in a cream panel (e.g. the message). */
  messageLabel?: string
  messageBody?: string
  /** Optional accent action button (mailto the submitter). */
  action?: { label: string; href: string }
  /** Optional note under the fields (e.g. "CV ci-joint"). */
  note?: string
  /** Footer line (timestamp / source). */
  footerNote: string
}

/** Full responsive, table-based HTML email matching the site's look. */
export function renderEmail(opts: EmailLayoutOptions): string {
  const messagePanel = opts.messageBody
    ? `
        <tr>
          <td style="padding-top:24px;">
            ${
              opts.messageLabel
                ? `<p style="margin:0 0 8px;font-family:${FONT_MONO};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${C.muted};">${esc(
                    opts.messageLabel,
                  )}</p>`
                : ''
            }
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.background};border:1px solid ${C.border};border-radius:12px;">
              <tr>
                <td style="padding:18px 20px;font-family:${FONT_SANS};font-size:15px;line-height:1.6;color:${C.foreground};">${multiline(
                  opts.messageBody,
                )}</td>
              </tr>
            </table>
          </td>
        </tr>`
    : ''

  const notePanel = opts.note
    ? `
        <tr>
          <td style="padding-top:20px;font-family:${FONT_SANS};font-size:14px;line-height:1.5;color:${C.muted};">${opts.note}</td>
        </tr>`
    : ''

  const actionButton = opts.action
    ? `
        <tr>
          <td style="padding-top:28px;">
            <a href="${esc(opts.action.href)}"
               style="display:inline-block;background:${C.accent};color:#ffffff;font-family:${FONT_SANS};font-size:14px;font-weight:500;text-decoration:none;padding:12px 26px;border-radius:999px;">
              ${esc(opts.action.label)}
            </a>
          </td>
        </tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <title>${esc(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.background};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(
    opts.preheader,
  )}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.background};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">

          <!-- Wordmark -->
          <tr>
            <td style="padding:0 4px 20px;">
              <p style="margin:0;font-family:${FONT_MONO};font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:${C.muted};">Entreprises Christian Lemelin</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:${C.surface};border:1px solid ${C.border};border-top:3px solid ${C.accent};border-radius:18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:40px;">
                    <p style="margin:0 0 14px;font-family:${FONT_MONO};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${C.muted};">${esc(
                      opts.eyebrow,
                    )}</p>
                    <h1 style="margin:0;font-family:${FONT_SANS};font-size:26px;line-height:1.15;font-weight:600;letter-spacing:-0.01em;color:${C.foreground};">${esc(
                      opts.title,
                    )}</h1>
                    <p style="margin:14px 0 0;font-family:${FONT_SANS};font-size:15px;line-height:1.6;color:${C.muted};">${esc(
                      opts.intro,
                    )}</p>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border-top:1px solid ${C.border};">
                      ${renderFieldRows(opts.fields)}
                    </table>
                    ${messagePanel}
                    ${notePanel}
                    ${actionButton}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:22px 4px 0;">
              <p style="margin:0;font-family:${FONT_MONO};font-size:11px;line-height:1.7;letter-spacing:0.04em;color:${C.muted};">
                ${esc(opts.footerNote)}<br>
                680, rue du Carbone · Québec, QC&nbsp;&nbsp;G2N 2L3 · (418) 841-1220
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Plain-text fallback (improves deliverability; some clients prefer it). */
export function renderText(opts: {
  eyebrow: string
  title: string
  fields: EmailField[]
  messageLabel?: string
  messageBody?: string
  note?: string
  footerNote: string
}): string {
  const lines: string[] = [opts.eyebrow.toUpperCase(), opts.title, '']
  // Strip HTML from field values for the text version.
  const strip = (s: string) => s.replace(/<[^>]+>/g, '')
  for (const f of opts.fields) {
    lines.push(`${f.label}: ${strip(f.value)}`)
  }
  if (opts.messageBody) {
    lines.push('', `${opts.messageLabel ?? 'Message'}:`, opts.messageBody)
  }
  if (opts.note) {
    lines.push('', strip(opts.note))
  }
  lines.push(
    '',
    '—',
    strip(opts.footerNote),
    'Entreprises Christian Lemelin · 680, rue du Carbone · Québec, QC G2N 2L3 · (418) 841-1220',
  )
  return lines.join('\n')
}

/** Quebec-localized timestamp used in the footer. */
export function formatTimestamp(date: Date): string {
  try {
    return new Intl.DateTimeFormat('fr-CA', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'America/Toronto',
    }).format(date)
  } catch {
    return date.toISOString()
  }
}
