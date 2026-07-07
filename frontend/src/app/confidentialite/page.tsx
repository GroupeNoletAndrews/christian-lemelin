import type { Metadata } from "next"
import Link from "next/link"
import { CONTACT, COMPANY } from "@/content"
import { getLocale } from "@/lib/server/locale"
import { t, tr, type Localized } from "@/lib/i18n"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: t("Politique de confidentialité", "Privacy Policy", locale),
    description: t(
      "Comment Entreprises Christian Lemelin recueille, utilise et protège vos renseignements personnels — formulaires, témoins (cookies) et droits prévus par la Loi 25.",
      "How Entreprises Christian Lemelin collects, uses and protects your personal information — forms, cookies and the rights provided under Quebec's Law 25.",
      locale,
    ),
  }
}

// Dernière révision du texte — à mettre à jour à chaque changement de contenu.
const LAST_UPDATED: Localized = { fr: "1er juillet 2026", en: "July 1, 2026" }

/** Section : hairline + label mono + contenu, façon OPUS. */
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

export default async function ConfidentialitePage() {
  const locale = await getLocale()
  return (
    <div data-header-theme="light" className="min-h-screen bg-background">
      <section className="pb-12 pt-40">
        <div className="mx-auto max-w-[860px] px-6">
          <h1 className="font-display text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
            {t("Politique de confidentialité", "Privacy Policy", locale)}
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-foreground-muted">
            {COMPANY.legalName}{" "}
            {t(
              "accorde une grande importance à la protection de vos renseignements personnels. Cette politique décrit ce que nous recueillons, pourquoi, et les droits que la Loi 25 (Québec) vous garantit.",
              "places great importance on protecting your personal information. This policy describes what we collect, why, and the rights that Quebec's Law 25 guarantees you.",
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
          <Section
            label={t(
              "Responsable de la protection des renseignements personnels",
              "Personal information protection officer",
              locale,
            )}
          >
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
            <p>
              {t(
                "Toute question ou demande relative à vos renseignements personnels peut être adressée à ces coordonnées.",
                "Any question or request regarding your personal information may be addressed to these contact details.",
                locale,
              )}
            </p>
          </Section>

          <Section
            label={t(
              "Renseignements que nous recueillons",
              "Information we collect",
              locale,
            )}
          >
            <p>
              {t(
                "Nous ne recueillons que les renseignements que vous nous transmettez volontairement :",
                "We only collect the information you voluntarily provide to us:",
                locale,
              )}
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>{t("Formulaire de contact", "Contact form", locale)}</strong>{" "}
                {t(
                  "— nom, courriel, téléphone (facultatif) et votre message.",
                  "— name, email, phone (optional) and your message.",
                  locale,
                )}
              </li>
              <li>
                <strong>{t("Candidature à un emploi", "Job application", locale)}</strong>{" "}
                {t(
                  "— nom, courriel, téléphone (facultatif), message (facultatif) et votre",
                  "— name, email, phone (optional), message (optional) and your",
                  locale,
                )}{" "}
                <strong>CV</strong>{" "}
                {t("si vous en joignez un.", "if you attach one.", locale)}
              </li>
            </ul>
            <p>
              {t(
                "Aucune navigation n'exige la création de compte et nous ne recueillons aucun renseignement personnel à votre insu.",
                "Browsing the site never requires creating an account, and we do not collect any personal information without your knowledge.",
                locale,
              )}
            </p>
          </Section>

          <Section
            label={t(
              "Utilisation de vos renseignements",
              "How we use your information",
              locale,
            )}
          >
            <p>
              {t(
                "Vos renseignements servent exclusivement à :",
                "Your information is used solely to:",
                locale,
              )}
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                {t(
                  "répondre à vos demandes d'information ou de soumission ;",
                  "respond to your requests for information or quotes;",
                  locale,
                )}
              </li>
              <li>
                {t(
                  "évaluer votre candidature et vous recontacter à ce sujet.",
                  "assess your job application and get back to you about it.",
                  locale,
                )}
              </li>
            </ul>
            <p>
              {t(
                "Nous ne vendons ni ne louons vos renseignements personnels, et nous ne les communiquons à aucun tiers à des fins commerciales.",
                "We do not sell or rent your personal information, and we do not share it with any third party for commercial purposes.",
                locale,
              )}
            </p>
          </Section>

          <Section
            label={t(
              "Hébergement et fournisseurs de services",
              "Hosting and service providers",
              locale,
            )}
          >
            <p>
              {t("Le site est hébergé par ", "The site is hosted by ", locale)}
              <strong>Vercel</strong>
              {t(
                " ; les messages et candidatures sont conservés dans une base de données ",
                "; messages and applications are stored in a ",
                locale,
              )}
              <strong>Supabase</strong>
              {t(
                ". Les CV sont stockés dans un espace ",
                " database. Résumés are kept in a ",
                locale,
              )}
              <strong>{t("privé", "private", locale)}</strong>
              {t(
                " dont l'accès est réservé à notre équipe. Les notifications par courriel transitent par ",
                " space accessible only to our team. Email notifications are sent through ",
                locale,
              )}
              <strong>Resend</strong>
              {t(".", ".", locale)}
            </p>
            <p>
              {t(
                "Ces fournisseurs peuvent héberger les données à l'extérieur du Québec ; nous ne retenons que des fournisseurs offrant des mesures de protection conformes aux exigences de la Loi 25.",
                "These providers may host data outside Quebec; we only select providers offering protection measures that meet the requirements of Law 25.",
                locale,
              )}
            </p>
          </Section>

          <Section
            label={t(
              "Témoins (cookies) et mesure d'audience",
              "Cookies and audience measurement",
              locale,
            )}
          >
            <p>
              {t(
                "Notre mesure d'audience (Vercel Web Analytics) est ",
                "Our audience measurement (Vercel Web Analytics) is ",
                locale,
              )}
              <strong>
                {t("anonyme et sans témoin", "anonymous and cookie-free", locale)}
              </strong>
              {t(
                " — aucun cookie de suivi n'est déposé. Les seuls témoins utilisés sont :",
                " — no tracking cookie is set. The only cookies used are:",
                locale,
              )}
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>cl_consent</strong>{" "}
                {t(
                  "— mémorise vos préférences de témoins pendant un an (témoin nécessaire).",
                  "— stores your cookie preferences for one year (necessary cookie).",
                  locale,
                )}
              </li>
              <li>
                <strong>
                  {t(
                    "Témoins de session d'administration",
                    "Administration session cookies",
                    locale,
                  )}
                </strong>{" "}
                {t(
                  "— réservés aux membres de notre équipe qui gèrent le contenu du site ; ils ne concernent pas les visiteurs.",
                  "— reserved for the team members who manage the site content; they do not concern visitors.",
                  locale,
                )}
              </li>
            </ul>
            <p>
              {t(
                "Si des témoins analytiques ou marketing devaient être introduits, ils ne seraient activés qu'avec votre consentement. Vous pouvez revoir votre choix en tout temps via le lien ",
                "If analytics or marketing cookies were to be introduced, they would only be enabled with your consent. You can review your choice at any time via the ",
                locale,
              )}
              <strong>
                {t("« Gérer les cookies »", "“Manage cookies”", locale)}
              </strong>
              {t(
                " au bas de chaque page.",
                " link at the bottom of every page.",
                locale,
              )}
            </p>
          </Section>

          <Section label={t("Conservation", "Retention", locale)}>
            <p>
              {t(
                "Les messages et candidatures sont conservés le temps nécessaire au suivi de votre demande ou du processus d'embauche, puis supprimés. Vous pouvez demander la suppression de votre CV ou de tout autre renseignement en tout temps aux coordonnées ci-dessus.",
                "Messages and applications are kept for as long as necessary to follow up on your request or the hiring process, then deleted. You may request the deletion of your résumé or any other information at any time using the contact details above.",
                locale,
              )}
            </p>
          </Section>

          <Section label={t("Vos droits (Loi 25)", "Your rights (Law 25)", locale)}>
            <p>
              {t(
                "La loi québécoise vous garantit notamment le droit :",
                "Quebec law guarantees you, among others, the right:",
                locale,
              )}
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                {t(
                  "d'accéder aux renseignements que nous détenons sur vous ;",
                  "to access the information we hold about you;",
                  locale,
                )}
              </li>
              <li>
                {t(
                  "de les faire rectifier s'ils sont inexacts ou incomplets ;",
                  "to have it corrected if it is inaccurate or incomplete;",
                  locale,
                )}
              </li>
              <li>
                {t(
                  "de retirer votre consentement et d'en demander la suppression ;",
                  "to withdraw your consent and request its deletion;",
                  locale,
                )}
              </li>
              <li>
                {t(
                  "de porter plainte auprès de la ",
                  "to file a complaint with the ",
                  locale,
                )}
                <a
                  href="https://www.cai.gouv.qc.ca/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  Commission d&apos;accès à l&apos;information du Québec
                </a>
                .
              </li>
            </ul>
            <p>
              {t(
                "Pour exercer ces droits, écrivez-nous à ",
                "To exercise these rights, write to us at ",
                locale,
              )}
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {CONTACT.email}
              </a>
              {t(
                ". Nous répondons dans les 30 jours prévus par la loi.",
                ". We respond within the 30 days provided by law.",
                locale,
              )}
            </p>
          </Section>

          <Section label={t("Modifications", "Changes", locale)}>
            <p>
              {t(
                "Cette politique peut être mise à jour pour refléter l'évolution du site ou de la réglementation ; la date de dernière mise à jour figure en haut de page. Pour toute question, ",
                "This policy may be updated to reflect changes to the site or to regulations; the last-updated date appears at the top of the page. For any question, ",
                locale,
              )}
              <Link
                href="/contact"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {t("contactez-nous", "contact us", locale)}
              </Link>
              .
            </p>
          </Section>
        </div>
      </section>
    </div>
  )
}
