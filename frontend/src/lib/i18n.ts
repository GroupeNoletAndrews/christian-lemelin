// Internationalisation FR/EN — cœur partagé (sûr côté client ET serveur, aucun
// secret, aucune dépendance serveur). La locale n'est PAS dans l'URL : elle vit
// dans un cookie (voir LOCALE_COOKIE), lu côté serveur par getLocale()
// (src/lib/server/locale.ts) et fourni aux composants clients par LocaleProvider.
//
// Le contenu bilingue s'écrit comme { fr, en } (type Localized) et se résout avec
// tr(value, locale). Les valeurs déjà « plates » (string) passent telles quelles,
// ce qui permet une migration progressive sans tout casser.

export const LOCALES = ["fr", "en"] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "fr"
export const LOCALE_COOKIE = "cl_locale"

/** Texte (ou n'importe quelle valeur) disponible dans les deux langues. */
export type Localized<T = string> = { fr: T; en: T }

/** Champ texte de contenu : soit une string (FR, non encore traduite → même
 *  valeur dans les deux langues), soit un objet bilingue { fr, en }. Permet une
 *  migration progressive : `tr(value, locale)` résout les deux cas. */
export type LocalizedText = string | Localized<string>

export function isLocale(v: string | undefined | null): v is Locale {
  return v === "fr" || v === "en"
}

function isLocalized(v: unknown): v is Localized<unknown> {
  return (
    typeof v === "object" &&
    v !== null &&
    "fr" in (v as Record<string, unknown>) &&
    "en" in (v as Record<string, unknown>)
  )
}

/** Résout une valeur possiblement bilingue pour une locale. */
export function tr<T>(value: Localized<T> | T, locale: Locale): T {
  return isLocalized(value) ? (value as Localized<T>)[locale] : (value as T)
}

/** Raccourci FR/EN pour un dictionnaire inline dans un composant. */
export function t(fr: string, en: string, locale: Locale): string {
  return locale === "en" ? en : fr
}

export const LOCALE_LABEL: Record<Locale, string> = { fr: "Français", en: "English" }
export const LOCALE_SHORT: Record<Locale, string> = { fr: "FR", en: "EN" }
export const OTHER_LOCALE: Record<Locale, Locale> = { fr: "en", en: "fr" }
