"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "@/components/providers/LocaleProvider"
import {
  LOCALE_COOKIE,
  LOCALE_SHORT,
  OTHER_LOCALE,
  LOCALES,
  type Locale,
} from "@/lib/i18n"

function persist(locale: Locale) {
  // 1 an, tout le site, SameSite=Lax (pas de suivi tiers).
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`
}

/**
 * Bascule de langue. Deux variantes :
 *  • "pill"   — petit bouton FR/EN compact pour la barre de nav (flottant).
 *  • "inline" — deux libellés « Français / English » pour l'overlay du menu.
 * Le changement écrit le cookie puis rafraîchit (router.refresh) → le serveur
 * re-rend dans la nouvelle langue, sans changer d'URL.
 */
export function LanguageToggle({
  variant = "pill",
  tone = "light",
  className = "",
}: {
  variant?: "pill" | "inline"
  tone?: "light" | "dark"
  className?: string
}) {
  const locale = useLocale()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const go = (next: Locale) => {
    if (next === locale) return
    persist(next)
    startTransition(() => router.refresh())
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-4 text-[12px] uppercase tracking-[0.15em] ${className}`}>
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => go(l)}
            disabled={pending}
            aria-current={l === locale}
            className={
              l === locale
                ? "text-white underline decoration-white decoration-2 underline-offset-4"
                : "text-white/45 transition-colors hover:text-white/80"
            }
          >
            {l === "fr" ? "Français" : "English"}
          </button>
        ))}
      </div>
    )
  }

  const other = OTHER_LOCALE[locale]
  const base =
    tone === "dark"
      ? "border-white/25 text-white/80 hover:border-white/50 hover:text-white"
      : "border-border text-foreground/70 hover:border-foreground/30 hover:text-foreground"

  return (
    <button
      type="button"
      onClick={() => go(other)}
      disabled={pending}
      aria-label={other === "fr" ? "Passer en français" : "Switch to English"}
      className={`inline-flex h-9 items-center gap-1 rounded-full border px-3 font-mono text-[11px] font-medium tracking-[0.08em] transition-colors ${base} ${className}`}
    >
      <span className={tone === "dark" ? "text-white" : "text-foreground"}>{LOCALE_SHORT[locale]}</span>
      <span className="opacity-35">/</span>
      <span className="opacity-45">{LOCALE_SHORT[other]}</span>
    </button>
  )
}
