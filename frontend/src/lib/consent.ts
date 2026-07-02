// Consentement cookies (Loi 25). Le site n'utilise AUCUN cookie de mesure —
// l'analytique (Vercel Web Analytics) est sans cookie — donc la bannière est
// minimale : les catégories Analytiques/Marketing existent pour d'éventuels
// scripts futurs (GA4/Ads), qui ne devront se charger que si consentis.

export interface Consent {
  /** Mesure d'audience avec cookie (aucune aujourd'hui — opt-in futur). */
  analytics: boolean
  /** Pixels/scripts publicitaires (aucun aujourd'hui — opt-in futur). */
  marketing: boolean
  /** Date du choix (ISO) — permet de re-demander après expiration. */
  ts: string
}

const COOKIE_NAME = "cl_consent"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 an

/** Événement déclenché par « Gérer les cookies » (footer) pour rouvrir la bannière. */
export const CONSENT_MANAGE_EVENT = "cl:manage-cookies"
/** Événement déclenché après chaque enregistrement de choix (détail: Consent). */
export const CONSENT_CHANGE_EVENT = "cl:consent-changed"

/** Le choix enregistré, ou null si l'utilisateur n'a pas encore répondu. */
export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1)
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    if (typeof parsed?.analytics !== "boolean" || typeof parsed?.marketing !== "boolean") {
      return null
    }
    return parsed as Consent
  } catch {
    return null
  }
}

export function writeConsent(choice: { analytics: boolean; marketing: boolean }): Consent {
  const consent: Consent = { ...choice, ts: new Date().toISOString() }
  const value = encodeURIComponent(JSON.stringify(consent))
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: consent }))
  return consent
}

/** Rouvre la bannière de consentement (lien « Gérer les cookies » du footer). */
export function openConsentManager(): void {
  window.dispatchEvent(new Event(CONSENT_MANAGE_EVENT))
}
