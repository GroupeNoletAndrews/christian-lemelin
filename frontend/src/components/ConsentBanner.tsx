"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import {
  CONSENT_MANAGE_EVENT,
  readConsent,
  writeConsent,
} from "@/lib/consent"

/**
 * Bannière de consentement minimale (Loi 25) : le site ne pose aucun cookie de
 * mesure (analytique sans témoin), la bannière sert donc surtout à consigner un
 * choix pour d'éventuels témoins analytiques/marketing futurs. Masquée dès
 * qu'un choix existe ; rouverte par « Gérer les cookies » (footer). Jamais
 * rendue dans l'aperçu admin (html.cl-preview) — l'admin n'a pas ce chrome.
 */
export function ConsentBanner() {
  const [open, setOpen] = useState(false)
  const [customize, setCustomize] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (document.documentElement.classList.contains("cl-preview")) return
    if (!readConsent()) setOpen(true)
    const onManage = () => {
      const current = readConsent()
      setAnalytics(current?.analytics ?? false)
      setMarketing(current?.marketing ?? false)
      setCustomize(true)
      setOpen(true)
    }
    window.addEventListener(CONSENT_MANAGE_EVENT, onManage)
    return () => window.removeEventListener(CONSENT_MANAGE_EVENT, onManage)
  }, [])

  const save = (choice: { analytics: boolean; marketing: boolean }) => {
    writeConsent(choice)
    setOpen(false)
    setCustomize(false)
  }

  const secondaryBtn =
    "rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/40"

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-label="Préférences de témoins (cookies)"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-4 bottom-4 z-[95] max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-xl sm:inset-x-auto sm:left-6 sm:bottom-6 md:p-7"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
            Témoins (cookies)
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
            Ce site n&apos;utilise que des témoins essentiels ; notre mesure
            d&apos;audience se fait sans témoin. Des témoins analytiques ou
            marketing ne seraient activés qu&apos;avec votre accord.{" "}
            <Link
              href="/confidentialite"
              className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Politique de confidentialité
            </Link>
          </p>

          {customize && (
            <div className="mt-5 space-y-3 border-t border-border pt-5">
              <label className="flex items-start gap-3 text-sm text-foreground-muted">
                <input type="checkbox" checked disabled className="mt-0.5 accent-accent" />
                <span>
                  <span className="text-foreground">Nécessaires</span> — fonctionnement du
                  site et mémorisation de ce choix. Toujours actifs.
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm text-foreground-muted">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-0.5 accent-accent"
                />
                <span>
                  <span className="text-foreground">Analytiques</span> — mesure
                  d&apos;audience avec témoin (aucune utilisée actuellement).
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm text-foreground-muted">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="mt-0.5 accent-accent"
                />
                <span>
                  <span className="text-foreground">Marketing</span> — publicité
                  personnalisée (aucune utilisée actuellement).
                </span>
              </label>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => save({ analytics: true, marketing: true })}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.99]"
            >
              Tout accepter
            </button>
            {customize ? (
              <button type="button" onClick={() => save({ analytics, marketing })} className={secondaryBtn}>
                Enregistrer mes choix
              </button>
            ) : (
              <button
                type="button"
                onClick={() => save({ analytics: false, marketing: false })}
                className={secondaryBtn}
              >
                Refuser le non-essentiel
              </button>
            )}
            {!customize && (
              <button
                type="button"
                onClick={() => setCustomize(true)}
                className="text-sm text-foreground-muted underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
              >
                Personnaliser
              </button>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
