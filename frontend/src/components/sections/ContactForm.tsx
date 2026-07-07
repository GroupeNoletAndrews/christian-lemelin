"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle } from "@phosphor-icons/react"
import { api } from "@/lib/api"
import { contactSchema, yupErrors } from "@/lib/forms"
import { useLocale } from "@/components/providers/LocaleProvider"
import { t } from "@/lib/i18n"

// Formulaire de contact — envoie au backend (POST /contact).
// Validation Yup côté client (noValidate — pas de validation navigateur).
// Réutilise les styles de champ d'ApplyModal pour rester cohérent.
export function ContactForm() {
  const locale = useLocale()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    const fd = new FormData(e.currentTarget)
    const values = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: (fd.get("phone") as string) || undefined,
      message: String(fd.get("message") ?? ""),
    }
    const fieldErrors = await yupErrors(contactSchema, values)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return
    setSubmitting(true)
    try {
      await api.contact.create(values)
      setSubmitted(true)
    } catch {
      setError(t("L'envoi a échoué. Veuillez réessayer.", "Sending failed. Please try again.", locale))
    } finally {
      setSubmitting(false)
    }
  }

  const labelClass =
    "mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted"
  const fieldClass =
    "w-full rounded-lg border bg-surface px-4 py-3 text-foreground placeholder-foreground-muted transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
  const fieldBorder = (key: string) => (errors[key] ? "border-red-400" : "border-border")
  const fieldError = (key: string) =>
    errors[key] ? <p className="mt-1.5 text-xs text-red-600">{errors[key]}</p> : null

  if (submitted) {
    return (
      <div className="flex flex-col items-start rounded-2xl border border-border bg-surface p-8 md:p-10">
        <CheckCircle size={44} weight="fill" className="text-accent" />
        <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">
          {t("Message envoyé", "Message sent", locale)}
        </h2>
        <p className="mt-3 max-w-[44ch] text-foreground-muted">
          {t(
            "Merci de nous avoir écrit. Notre équipe vous répond dans les meilleurs délais — généralement sous 24 heures ouvrables.",
            "Thank you for reaching out. Our team will get back to you as soon as possible — usually within 24 business hours.",
            locale,
          )}
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-border bg-surface p-6 md:p-8"
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="ct-name" className={labelClass}>
            {t("Nom complet", "Full name", locale)} <span className="text-accent">*</span>
          </label>
          <input
            id="ct-name"
            name="name"
            type="text"
            placeholder={t("Votre nom", "Your name", locale)}
            aria-invalid={!!errors.name}
            className={`${fieldClass} ${fieldBorder("name")}`}
          />
          {fieldError("name")}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ct-email" className={labelClass}>
              {t("Courriel", "Email", locale)} <span className="text-accent">*</span>
            </label>
            <input
              id="ct-email"
              name="email"
              type="email"
              placeholder={t("vous@exemple.com", "you@example.com", locale)}
              aria-invalid={!!errors.email}
              className={`${fieldClass} ${fieldBorder("email")}`}
            />
            {fieldError("email")}
          </div>
          <div>
            <label htmlFor="ct-phone" className={labelClass}>
              {t("Téléphone", "Phone", locale)}{" "}
              <span className="normal-case tracking-normal text-foreground-muted">
                {t("(optionnel)", "(optional)", locale)}
              </span>
            </label>
            <input
              id="ct-phone"
              name="phone"
              type="tel"
              placeholder="(418) 000-0000"
              className={`${fieldClass} border-border`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="ct-message" className={labelClass}>
            {t("Votre projet", "Your project", locale)} <span className="text-accent">*</span>
          </label>
          <textarea
            id="ct-message"
            name="message"
            rows={5}
            placeholder={t(
              "Décrivez votre projet, vos matériaux et vos échéances…",
              "Describe your project, materials and deadlines…",
              locale,
            )}
            aria-invalid={!!errors.message}
            className={`${fieldClass} resize-none ${fieldBorder("message")}`}
          />
          {fieldError("message")}
        </div>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? t("Envoi...", "Sending...", locale)
            : t("Envoyer le message", "Send message", locale)}
        </button>
        <p className="text-center text-xs leading-relaxed text-foreground-muted">
          {t(
            "Vos renseignements ne servent qu'à répondre à votre demande — voir la ",
            "Your information is used only to respond to your request — see the ",
            locale,
          )}
          <Link
            href="/confidentialite"
            className="underline decoration-border underline-offset-2 transition-colors hover:text-foreground"
          >
            {t("politique de confidentialité", "privacy policy", locale)}
          </Link>
          .
        </p>
      </div>
    </form>
  )
}
