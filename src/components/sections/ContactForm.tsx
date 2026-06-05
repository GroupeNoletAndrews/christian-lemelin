"use client"

import { useState } from "react"
import { CheckCircle } from "@phosphor-icons/react"

// Formulaire de contact — pas de backend pour l'instant : accuse réception.
// Réutilise les styles de champ d'ApplyModal pour rester cohérent.
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  const labelClass =
    "mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted"
  const fieldClass =
    "w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder-foreground-muted transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"

  if (submitted) {
    return (
      <div className="flex flex-col items-start rounded-2xl border border-border bg-surface p-8 md:p-10">
        <CheckCircle size={44} weight="fill" className="text-accent" />
        <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">
          Message envoyé
        </h2>
        <p className="mt-3 max-w-[44ch] text-foreground-muted">
          Merci de nous avoir écrit. Notre équipe vous répond dans les meilleurs délais —
          généralement sous 24 heures ouvrables.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
      className="rounded-2xl border border-border bg-surface p-6 md:p-8"
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="ct-name" className={labelClass}>
            Nom complet <span className="text-accent">*</span>
          </label>
          <input id="ct-name" type="text" required placeholder="Votre nom" className={fieldClass} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ct-email" className={labelClass}>
              Courriel <span className="text-accent">*</span>
            </label>
            <input
              id="ct-email"
              type="email"
              required
              placeholder="vous@exemple.com"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="ct-phone" className={labelClass}>
              Téléphone{" "}
              <span className="normal-case tracking-normal text-foreground-muted">(optionnel)</span>
            </label>
            <input id="ct-phone" type="tel" placeholder="(418) 000-0000" className={fieldClass} />
          </div>
        </div>
        <div>
          <label htmlFor="ct-message" className={labelClass}>
            Votre projet <span className="text-accent">*</span>
          </label>
          <textarea
            id="ct-message"
            required
            rows={5}
            placeholder="Décrivez votre projet, vos matériaux et vos échéances…"
            className={`${fieldClass} resize-none`}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.99]"
        >
          Envoyer le message
        </button>
      </div>
    </form>
  )
}
