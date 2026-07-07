import type { Metadata } from "next"
import Link from "next/link"
import { JobAccordion } from "@/components/emplois/JobAccordion"
import { COMPANY } from "@/content"
import { getLocale } from "@/lib/server/locale"
import { t, tr } from "@/lib/i18n"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: t("Emplois", "Careers", locale),
    description: t(
      "Rejoignez Entreprises Christian Lemelin et façonnez votre avenir dans la fabrication métallique sur mesure à Québec. Découvrez nos postes ouverts.",
      "Join Entreprises Christian Lemelin and shape your future in custom metal fabrication in Québec City. Discover our open positions.",
      locale,
    ),
  }
}

export default async function EmploisPage() {
  const locale = await getLocale()

  // Avantages employés — repris du site original (page « Emplois »).
  const AVANTAGES: { title: string; body: string }[] = [
    {
      title: t("Formation continue", "Continuous training", locale),
      body: t(
        "Développez votre expertise au contact de projets techniques d'envergure.",
        "Grow your expertise through large-scale technical projects.",
        locale,
      ),
    },
    {
      title: t("Équipe soudée", "A close-knit team", locale),
      body: t(
        "Un environnement collaboratif axé sur le respect et l'excellence.",
        "A collaborative environment built on respect and excellence.",
        locale,
      ),
    },
    {
      title: t("Projets stimulants", "Engaging projects", locale),
      body: t(
        "Participez à des réalisations concrètes et sur mesure.",
        "Take part in tangible, custom-built projects.",
        locale,
      ),
    },
    {
      title: t("Rémunération compétitive", "Competitive compensation", locale),
      body: t(
        "Salaire concurrentiel selon l'expérience.",
        "Competitive salary based on experience.",
        locale,
      ),
    },
    {
      title: t("Équilibre travail-vie personnelle", "Work-life balance", locale),
      body: t(
        "Une organisation qui favorise la stabilité.",
        "A workplace that fosters stability.",
        locale,
      ),
    },
    {
      title: t("Avancement professionnel", "Career advancement", locale),
      body: t("Des possibilités réelles d'évolution.", "Real opportunities for growth.", locale),
    },
    {
      title: t("Technologies spécialisées", "Specialized technology", locale),
      body: t(
        "Travaillez avec des équipements de pointe.",
        "Work with state-of-the-art equipment.",
        locale,
      ),
    },
    {
      title: t("Valorisation du talent", "Talent that's valued", locale),
      body: t(
        "Vos idées et votre savoir-faire comptent.",
        "Your ideas and expertise matter.",
        locale,
      ),
    },
  ]

  return (
    <div className="bg-background" data-header-theme="light">
      {/* Hero */}
      <section className="pb-6 pt-40 md:pb-10">
        <div className="mx-auto max-w-[1100px] px-6">
          <h1 className="max-w-[16ch] font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-foreground">
            {t("Rejoignez notre équipe.", "Join our team.", locale)}
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-foreground-muted">
            {t(
              "Découvrez nos offres d'emploi et prenez part à l'aventure chez Entreprises Christian Lemelin.",
              "Explore our job openings and take part in the journey at Entreprises Christian Lemelin.",
              locale,
            )}
          </p>
          <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-foreground-muted">
            {t(
              "Les candidatures et CV reçus sont traités confidentiellement, conformément à notre",
              "Applications and résumés we receive are handled confidentially, in accordance with our",
              locale,
            )}{" "}
            <Link
              href="/confidentialite"
              className="underline decoration-border underline-offset-2 transition-colors hover:text-foreground"
            >
              {t("politique de confidentialité", "privacy policy", locale)}
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Pourquoi nous joindre — 8 avantages */}
      <section className="mx-auto max-w-[1100px] px-6 pb-8 pt-10 md:pb-12 md:pt-16">
        <div className="max-w-[60ch]">
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-tight text-foreground">
            {t("Pourquoi joindre", "Why join", locale)} {tr(COMPANY.shortName, locale)}
            {t(" ?", "?", locale)}
          </h2>
          <p className="mt-5 leading-relaxed text-foreground-muted">
            {t(
              "Chaque mandat est une occasion de repousser les standards de qualité, d'innover et de contribuer à des réalisations concrètes au sein d'une équipe engagée.",
              "Every mandate is an opportunity to raise quality standards, innovate, and contribute to tangible achievements within a committed team.",
              locale,
            )}
          </p>
        </div>
        <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {AVANTAGES.map((a) => (
            <div key={a.title} className="border-t border-border pt-5">
              <h3 className="font-display text-lg font-medium text-foreground">{a.title}</h3>
              <p className="mt-2 leading-relaxed text-foreground-muted">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      <JobAccordion />

      {/* Rejoignez E.C. Lemelin — bloc éditorial sombre */}
      <section data-header-theme="dark" className="bg-background px-3 py-3 md:px-4 md:py-4">
        <div className="overflow-hidden rounded-[1.75rem] bg-ink px-6 py-16 md:rounded-[2.5rem] md:px-16 md:py-24">
          <h2 className="max-w-[16ch] font-display text-[clamp(2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-white">
            {t(
              "Rejoignez E.C. Lemelin et façonnez votre avenir.",
              "Join E.C. Lemelin and shape your future.",
              locale,
            )}
          </h2>
          <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-white/65">
            {t(
              "Vous valorisez votre expertise et votre engagement ? Chez Entreprises Christian Lemelin, nous vous offrons l'opportunité de repousser les limites de l'innovation et d'exercer pleinement votre savoir-faire.",
              "Do you value your expertise and commitment? At Entreprises Christian Lemelin, we offer you the opportunity to push the limits of innovation and fully put your craft to work.",
              locale,
            )}
          </p>
        </div>
      </section>
    </div>
  )
}
