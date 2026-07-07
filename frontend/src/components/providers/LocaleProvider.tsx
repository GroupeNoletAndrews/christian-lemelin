"use client"

import { createContext, useContext } from "react"
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n"

// La locale résolue côté serveur (cookie) est passée en prop depuis le layout
// racine et diffusée aux composants clients. Le changement de langue écrit le
// cookie puis router.refresh() (voir LanguageToggle) → le serveur re-rend avec
// la nouvelle locale, aucune URL ne change.
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocale(): Locale {
  return useContext(LocaleContext)
}
