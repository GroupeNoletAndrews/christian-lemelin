"use client"

import Link from "next/link"
import Image from "next/image"
import {
  InstagramLogoIcon,
  FacebookLogoIcon,
} from "@phosphor-icons/react/dist/ssr"
import { CONTACT, COMPANY, HOURS } from "@/content"
import { mediaUrl, SITE_MEDIA } from "@/lib/media"
import { openConsentManager } from "@/lib/consent"
import { useLocale } from "@/components/providers/LocaleProvider"
import { tr, t, type Localized } from "@/lib/i18n"

// Footer aligné sur la brochure PDF : bandeau « Durabilité & innovation », bloc
// contact (coordonnées de site.ts), puis colonnes ENTREPRISE / MÉDIAS / NOS
// EMPLOIS — liens dérivés du contenu pour ne jamais diverger des routes. Voir
// DESIGN.md. Bilingue FR/EN (locale via cookie).

const columns: { title: Localized; links: { label: Localized; href: string }[] }[] = [
  {
    title: { fr: "Entreprise", en: "Company" },
    links: [
      { label: { fr: "À propos de nous", en: "About us" }, href: "/a-propos" },
      { label: { fr: "Installations & capacité", en: "Facilities & capacity" }, href: "/installations" },
      { label: { fr: "Fabrication sur mesure", en: "Custom fabrication" }, href: "/fabrication" },
      { label: { fr: "Nous contacter", en: "Contact us" }, href: "/contact" },
    ],
  },
  {
    title: { fr: "Médias", en: "Media" },
    links: [{ label: { fr: "Nos réalisations", en: "Our projects" }, href: "/realisations" }],
  },
  {
    title: { fr: "Nos emplois", en: "Careers" },
    links: [{ label: { fr: "Emplois disponibles", en: "Open positions" }, href: "/emplois" }],
  },
]

const contactCells: { label: Localized; lines?: string[]; href?: string; value?: string }[] = [
  { label: { fr: "Atelier", en: "Workshop" }, lines: [CONTACT.addressLine, CONTACT.addressCity] },
  { label: { fr: "Courriel", en: "Email" }, href: `mailto:${CONTACT.email}`, value: CONTACT.email },
  { label: { fr: "Téléphone", en: "Phone" }, href: `tel:${CONTACT.phoneHref}`, value: CONTACT.phoneDisplay },
]

const socials = [
  { Icon: FacebookLogoIcon, label: "Facebook", href: "https://www.facebook.com/p/Les-Entreprises-Christian-Lemelin-100063067488326/" },
  { Icon: InstagramLogoIcon, label: "Instagram", href: "https://www.instagram.com/entreprises_christian_lemelin/" }
]

export function Footer() {
  const locale = useLocale()
  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="mx-auto max-w-[1400px] px-6 pb-10 pt-20 md:px-12 md:pt-28">
        {/* Bandeau */}
        <div>
          <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.01em] text-white">
            {t("Durabilité & innovation", "Durability & innovation", locale)}
          </h2>
          <p className="font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.01em] text-white/45">
            {t("E.C. Lemelin, synonyme de qualité.", "E.C. Lemelin, a byword for quality.", locale)}
          </p>
        </div>

        {/* Bloc contact */}
        <div className="mt-12 grid overflow-hidden rounded-2xl border border-white/12 md:grid-cols-3">
          {contactCells.map((c) => (
            <div
              key={c.label.fr}
              className="border-t border-white/12 p-6 first:border-t-0 md:border-l md:border-t-0 md:first:border-l-0"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                {tr(c.label, locale)}
              </p>
              {c.lines
                ? c.lines.map((line) => (
                    <p key={line} className="mt-2 text-white/85 first:mt-2 [&:not(:first-child)]:mt-0">
                      {line}
                    </p>
                  ))
                : (
                    <a
                      href={c.href}
                      className="mt-2 inline-block text-white/85 underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
                    >
                      {c.value}
                    </a>
                  )}
            </div>
          ))}
        </div>

        {/* Colonnes de liens */}
        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title.fr}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                {tr(col.title, locale)}
              </p>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {tr(l.label, locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* Heures d'ouverture — même gabarit que les colonnes, volontairement discret */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
              {t("Heures d'ouverture", "Opening hours", locale)}
            </p>
            <ul className="mt-5 space-y-3">
              {HOURS.map((h) => (
                <li key={h.days.fr} className="text-sm leading-snug">
                  <span className="text-white/70">{tr(h.days, locale)}</span>
                  <br />
                  <span className="text-white/45">{tr(h.hours, locale)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Wordmark de marque (logo blanc sur fond sombre) */}
        <div className="mt-16">
          <Image
            src={mediaUrl(SITE_MEDIA.logoBlanc)}
            alt="Les Entreprises Christian Lemelin"
            width={1500}
            height={240}
            unoptimized
            className="h-12 w-auto max-w-full md:h-20"
          />
        </div>

        {/* Bas de page */}
        <div className="mt-12 flex flex-col gap-6 border-t border-white/12 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-white/45">
            © {new Date().getFullYear()} {COMPANY.legalName} {t("Tous droits réservés.", "All rights reserved.", locale)} · Québec · Canada · RBQ {COMPANY.rbq} · powered by{" "}
            <a
              href="https://www.noletandrews.ca/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 underline decoration-white/30 underline-offset-2 transition-colors hover:text-white hover:decoration-white"
            >
              G.N.A
            </a>
            {" · "}
            <Link
              href="/confidentialite"
              className="text-white/70 underline decoration-white/30 underline-offset-2 transition-colors hover:text-white hover:decoration-white"
            >
              {t("Confidentialité", "Privacy", locale)}
            </Link>
            {" · "}
            <Link
              href="/conditions-utilisation"
              className="text-white/70 underline decoration-white/30 underline-offset-2 transition-colors hover:text-white hover:decoration-white"
            >
              {t("Conditions d'utilisation", "Terms of use", locale)}
            </Link>
            {" · "}
            <button
              type="button"
              onClick={openConsentManager}
              className="text-white/70 underline decoration-white/30 underline-offset-2 transition-colors hover:text-white hover:decoration-white"
            >
              {t("Gérer les cookies", "Manage cookies", locale)}
            </button>
          </p>
          <div className="flex items-center gap-3">
            {socials.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid size-9 place-items-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-white/40 hover:text-white"
              >
                <Icon size={16} weight="fill" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
