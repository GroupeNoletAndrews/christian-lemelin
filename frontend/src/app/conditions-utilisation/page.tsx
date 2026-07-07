import type { Metadata } from "next"
import Link from "next/link"
import { CONTACT, COMPANY } from "@/content"
import { getLocale } from "@/lib/server/locale"
import { t, tr, type Localized } from "@/lib/i18n"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: t("Conditions d'utilisation", "Terms of use", locale),
    description: t(
      "Conditions générales d'utilisation du site des Entreprises Christian Lemelin : accès, propriété intellectuelle, responsabilités et droit applicable (Québec, Canada).",
      "General terms of use for the Entreprises Christian Lemelin website: access, intellectual property, liability and applicable law (Quebec, Canada).",
      locale,
    ),
  }
}

// Dernière révision du texte — à mettre à jour à chaque changement de contenu.
const LAST_UPDATED: Localized = { fr: "6 juillet 2026", en: "July 6, 2026" }

/** Section : hairline + label mono + contenu, façon OPUS (aligné sur /confidentialite). */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-10">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
        {label}
      </h2>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-foreground-muted [&_strong]:font-medium [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  )
}

const services: Localized[] = [
  { fr: "Fabrication métallique sur mesure", en: "Custom metal fabrication" },
  {
    fr: "Conception et réalisation de projets métalliques",
    en: "Design and delivery of metal projects",
  },
  { fr: "Mobilier architectural métallique", en: "Architectural metal furniture" },
  { fr: "Soudure spécialisée", en: "Specialized welding" },
  {
    fr: "Fabrication commerciale et industrielle",
    en: "Commercial and industrial fabrication",
  },
  {
    fr: "Transformation de l'acier, de l'aluminium, de l'acier inoxydable, du cuivre et du laiton",
    en: "Working with steel, aluminum, stainless steel, copper and brass",
  },
  {
    fr: "Réalisation de structures et composantes métalliques personnalisées",
    en: "Fabrication of custom metal structures and components",
  },
  {
    fr: "Analyse de projets et accompagnement technique",
    en: "Project analysis and technical support",
  },
]

export default async function ConditionsUtilisationPage() {
  const locale = await getLocale()
  return (
    <div data-header-theme="light" className="min-h-screen bg-background">
      <section className="pb-12 pt-40">
        <div className="mx-auto max-w-[860px] px-6">
          <h1 className="font-display text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
            {t("Conditions d'utilisation", "Terms of use", locale)}
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-foreground-muted">
            {t("L'utilisation du site de ", "Use of the ", locale)}
            {COMPANY.legalName}
            {t(
              " est soumise aux présentes conditions générales. En naviguant sur ce site, vous les acceptez ; si vous ne les acceptez pas, veuillez ne pas l'utiliser.",
              " website is subject to these general terms of use. By browsing this site, you accept them; if you do not accept them, please do not use it.",
              locale,
            )}
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
            {t("Dernière mise à jour", "Last updated", locale)} : {tr(LAST_UPDATED, locale)}
          </p>
        </div>
      </section>

      <section className="pb-28 md:pb-36">
        <div className="mx-auto max-w-[860px] space-y-14 px-6">
          <Section label={t("Objet", "Purpose", locale)}>
            <p>
              {t(
                "Les présentes conditions définissent les modalités d'accès et d'utilisation du site, ainsi que les droits et obligations des utilisateurs et de l'entreprise.",
                "These terms define the conditions of access to and use of the site, as well as the rights and obligations of users and of the company.",
                locale,
              )}
            </p>
          </Section>

          <Section label={t("Acceptation des conditions", "Acceptance of the terms", locale)}>
            <p>
              {t(
                "En utilisant ce site, vous reconnaissez avoir pris connaissance des présentes conditions et vous engagez à les respecter. Elles peuvent être modifiées à tout moment ; la version en vigueur est celle publiée sur cette page.",
                "By using this site, you acknowledge that you have read these terms and agree to comply with them. They may be modified at any time; the version in force is the one published on this page.",
                locale,
              )}
            </p>
          </Section>

          <Section label={t("Services offerts", "Services offered", locale)}>
            <p>
              {t("Le site présente les services offerts par ", "The site presents the services offered by ", locale)}
              {COMPANY.shortName}
              {t(", notamment :", ", including:", locale)}
            </p>
            <ul className="list-disc space-y-2 pl-5">
              {services.map((s) => (
                <li key={s.fr}>{tr(s, locale)}</li>
              ))}
            </ul>
            <p>
              {t(
                "Certaines sections peuvent nécessiter la transmission de renseignements via un formulaire de contact ou de candidature.",
                "Some sections may require submitting information via a contact or job-application form.",
                locale,
              )}
            </p>
          </Section>

          <Section label={t("Accès au site", "Access to the site", locale)}>
            <p>
              {t(
                "Le site est accessible en tout temps, sauf interruption temporaire pour maintenance ou problème technique. ",
                "The site is accessible at all times, except for temporary interruptions for maintenance or technical issues. ",
                locale,
              )}
              {COMPANY.shortName}
              {t(
                " ne peut être tenue responsable des interruptions ou des difficultés d'accès. Vous vous engagez à utiliser le site conformément aux lois applicables et à ne pas nuire à son bon fonctionnement.",
                " cannot be held responsible for interruptions or access difficulties. You agree to use the site in accordance with applicable laws and not to interfere with its proper operation.",
                locale,
              )}
            </p>
          </Section>

          <Section label={t("Propriété intellectuelle", "Intellectual property", locale)}>
            <p>
              {t(
                "L'ensemble du contenu du site (textes, images, logos, photographies, documents, plans, dessins techniques et éléments graphiques) demeure la propriété exclusive de ",
                "All content on the site (text, images, logos, photographs, documents, plans, technical drawings and graphic elements) remains the exclusive property of ",
                locale,
              )}
              {COMPANY.legalName}
              {t(
                " ou de ses partenaires. Toute reproduction, modification ou diffusion sans autorisation préalable est interdite.",
                " or its partners. Any reproduction, modification or distribution without prior authorization is prohibited.",
                locale,
              )}
            </p>
          </Section>

          <Section label={t("Responsabilités", "Liability", locale)}>
            <p>
              {COMPANY.shortName}
              {t(
                " s'efforce de fournir des informations exactes et à jour, sans toutefois garantir l'exactitude complète du contenu publié. Vous demeurez responsable de l'usage que vous faites des informations accessibles sur le site. ",
                " strives to provide accurate and up-to-date information, without however guaranteeing the complete accuracy of the published content. You remain responsible for the use you make of the information available on the site. ",
                locale,
              )}
              {COMPANY.shortName}
              {t(
                " ne pourra être tenue responsable des dommages directs ou indirects liés à l'utilisation du site, y compris les pertes de données ou problèmes informatiques.",
                " cannot be held liable for any direct or indirect damages related to the use of the site, including data loss or computer problems.",
                locale,
              )}
            </p>
          </Section>

          <Section label={t("Liens externes", "External links", locale)}>
            <p>
              {t(
                "Le site peut contenir des liens vers des sites externes. ",
                "The site may contain links to external sites. ",
                locale,
              )}
              {COMPANY.shortName}
              {t(
                " n'exerce aucun contrôle sur ces plateformes et décline toute responsabilité quant à leur contenu.",
                " exercises no control over these platforms and disclaims any responsibility for their content.",
                locale,
              )}
            </p>
          </Section>

          <Section label={t("Données personnelles", "Personal data", locale)}>
            <p>
              {t(
                "L'utilisation du site peut entraîner la collecte de certains renseignements personnels via les formulaires. Ces renseignements sont traités conformément à notre ",
                "Using the site may involve collecting certain personal information via the forms. This information is processed in accordance with our ",
                locale,
              )}
              <Link
                href="/confidentialite"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {t("politique de confidentialité", "privacy policy", locale)}
              </Link>
              {t(
                ", dans le respect de la Loi 25 (Québec).",
                ", in compliance with Quebec's Law 25.",
                locale,
              )}
            </p>
          </Section>

          <Section label={t("Utilisation interdite", "Prohibited use", locale)}>
            <p>{t("Vous vous engagez à ne pas :", "You agree not to:", locale)}</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                {t(
                  "utiliser le site à des fins frauduleuses ou illégales ;",
                  "use the site for fraudulent or illegal purposes;",
                  locale,
                )}
              </li>
              <li>
                {t(
                  "diffuser du contenu offensant ou nuisible ;",
                  "publish offensive or harmful content;",
                  locale,
                )}
              </li>
              <li>
                {t(
                  "tenter d'accéder à des données non autorisées ;",
                  "attempt to access unauthorized data;",
                  locale,
                )}
              </li>
              <li>
                {t(
                  "perturber le fonctionnement du site par des actions malveillantes ou du pourriel (spam).",
                  "disrupt the operation of the site through malicious actions or spam.",
                  locale,
                )}
              </li>
            </ul>
          </Section>

          <Section label={t("Modifications des conditions", "Changes to the terms", locale)}>
            <p>
              {COMPANY.shortName}
              {t(
                " peut modifier les présentes conditions en tout temps afin de refléter l'évolution du site ou de la réglementation applicable. Il est recommandé de consulter cette page régulièrement.",
                " may modify these terms at any time to reflect changes to the site or applicable regulations. We recommend consulting this page regularly.",
                locale,
              )}
            </p>
          </Section>

          <Section label={t("Droit applicable", "Applicable law", locale)}>
            <p>
              {t(
                "Les présentes conditions sont régies par les lois du Québec et du Canada. Tout litige sera soumis aux tribunaux compétents de la province de Québec.",
                "These terms are governed by the laws of Quebec and Canada. Any dispute shall be submitted to the competent courts of the province of Quebec.",
                locale,
              )}
            </p>
          </Section>

          <Section label={t("Contact", "Contact", locale)}>
            <p>
              <strong>{COMPANY.legalName}</strong>
              <br />
              {CONTACT.addressLine}, {CONTACT.addressCity}
              <br />
              {t("Courriel", "Email", locale)} :{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {CONTACT.email}
              </a>{" "}
              · {t("Téléphone", "Phone", locale)} :{" "}
              <a
                href={`tel:${CONTACT.phoneHref}`}
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {CONTACT.phoneDisplay}
              </a>
              <br />
              {t("Licence RBQ", "RBQ licence", locale)} : {COMPANY.rbq}
            </p>
          </Section>
        </div>
      </section>
    </div>
  )
}
