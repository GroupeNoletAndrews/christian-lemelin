"use client"

import Link from "next/link"
import { useLocale } from "@/components/providers/LocaleProvider"
import { t } from "@/lib/i18n"

// Closing CTA used across the site (home + detail pages). Props are optional and
// default to the localized home wording, so existing usages keep working.
export function ContactCTA({
  heading,
  body,
  label,
  href = "/contact",
}: {
  heading?: string
  body?: string
  label?: string
  href?: string
} = {}) {
  const locale = useLocale()
  const h = heading ?? t("Un projet métal en tête ?", "A metal project in mind?", locale)
  const b =
    body ??
    t(
      "Parlez-nous de votre projet. Notre équipe technique vous répond dans les 24 heures.",
      "Tell us about your project. Our technical team replies within 24 hours.",
      locale,
    )
  const l = label ?? t("Nous joindre", "Contact us", locale)
  return (
    <section data-header-theme="dark" className="bg-ink  text-white pt-20">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center px-6 text-center md:px-12">
        <h2 className="max-w-[18ch] font-display text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[1] tracking-[-0.02em] text-white">
          {h}
        </h2>
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-white/55">{b}</p>
        <Link
          href={href}
          className="mt-12 inline-flex h-12 items-center rounded-full bg-accent px-8 text-[14px] font-medium tracking-[0.02em] text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.97]"
        >
          {l}
        </Link>
      </div>
    </section>
  )
}
