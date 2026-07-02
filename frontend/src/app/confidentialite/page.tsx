import type { Metadata } from "next"
import Link from "next/link"
import { CONTACT, COMPANY } from "@/content"

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment Entreprises Christian Lemelin recueille, utilise et protège vos renseignements personnels — formulaires, témoins (cookies) et droits prévus par la Loi 25.",
}

// Dernière révision du texte — à mettre à jour à chaque changement de contenu.
const LAST_UPDATED = "1er juillet 2026"

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

export default function ConfidentialitePage() {
  return (
    <div data-header-theme="light" className="min-h-screen bg-background">
      <section className="pb-12 pt-40">
        <div className="mx-auto max-w-[860px] px-6">
          <h1 className="font-display text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
            Politique de confidentialité
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-foreground-muted">
            {COMPANY.legalName} accorde une grande importance à la protection de vos
            renseignements personnels. Cette politique décrit ce que nous recueillons,
            pourquoi, et les droits que la Loi 25 (Québec) vous garantit.
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
            Dernière mise à jour : {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="pb-28 md:pb-36">
        <div className="mx-auto max-w-[860px] space-y-14 px-6">
          <Section label="Responsable de la protection des renseignements personnels">
            <p>
              <strong>{COMPANY.legalName}</strong>
              <br />
              {CONTACT.addressLine}, {CONTACT.addressCity}
              <br />
              Courriel :{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {CONTACT.email}
              </a>{" "}
              · Téléphone :{" "}
              <a
                href={`tel:${CONTACT.phoneHref}`}
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {CONTACT.phoneDisplay}
              </a>
            </p>
            <p>
              Toute question ou demande relative à vos renseignements personnels peut être
              adressée à ces coordonnées.
            </p>
          </Section>

          <Section label="Renseignements que nous recueillons">
            <p>
              Nous ne recueillons que les renseignements que vous nous transmettez
              volontairement :
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Formulaire de contact</strong> — nom, courriel, téléphone
                (facultatif) et votre message.
              </li>
              <li>
                <strong>Candidature à un emploi</strong> — nom, courriel, téléphone
                (facultatif), message (facultatif) et votre <strong>CV</strong> si vous en
                joignez un.
              </li>
            </ul>
            <p>
              Aucune navigation n&apos;exige la création de compte et nous ne recueillons
              aucun renseignement personnel à votre insu.
            </p>
          </Section>

          <Section label="Utilisation de vos renseignements">
            <p>Vos renseignements servent exclusivement à :</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>répondre à vos demandes d&apos;information ou de soumission ;</li>
              <li>évaluer votre candidature et vous recontacter à ce sujet.</li>
            </ul>
            <p>
              Nous ne vendons ni ne louons vos renseignements personnels, et nous ne les
              communiquons à aucun tiers à des fins commerciales.
            </p>
          </Section>

          <Section label="Hébergement et fournisseurs de services">
            <p>
              Le site est hébergé par <strong>Vercel</strong> ; les messages et
              candidatures sont conservés dans une base de données{" "}
              <strong>Supabase</strong>. Les CV sont stockés dans un espace{" "}
              <strong>privé</strong> dont l&apos;accès est réservé à notre équipe. Les
              notifications par courriel transitent par <strong>Resend</strong>.
            </p>
            <p>
              Ces fournisseurs peuvent héberger les données à l&apos;extérieur du Québec ;
              nous ne retenons que des fournisseurs offrant des mesures de protection
              conformes aux exigences de la Loi 25.
            </p>
          </Section>

          <Section label="Témoins (cookies) et mesure d'audience">
            <p>
              Notre mesure d&apos;audience (Vercel Web Analytics) est{" "}
              <strong>anonyme et sans témoin</strong> — aucun cookie de suivi n&apos;est
              déposé. Les seuls témoins utilisés sont :
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>cl_consent</strong> — mémorise vos préférences de témoins pendant
                un an (témoin nécessaire).
              </li>
              <li>
                <strong>Témoins de session d&apos;administration</strong> — réservés aux
                membres de notre équipe qui gèrent le contenu du site ; ils ne concernent
                pas les visiteurs.
              </li>
            </ul>
            <p>
              Si des témoins analytiques ou marketing devaient être introduits, ils ne
              seraient activés qu&apos;avec votre consentement. Vous pouvez revoir votre
              choix en tout temps via le lien <strong>« Gérer les cookies »</strong> au bas
              de chaque page.
            </p>
          </Section>

          <Section label="Conservation">
            <p>
              Les messages et candidatures sont conservés le temps nécessaire au suivi de
              votre demande ou du processus d&apos;embauche, puis supprimés. Vous pouvez
              demander la suppression de votre CV ou de tout autre renseignement en tout
              temps aux coordonnées ci-dessus.
            </p>
          </Section>

          <Section label="Vos droits (Loi 25)">
            <p>La loi québécoise vous garantit notamment le droit :</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>d&apos;accéder aux renseignements que nous détenons sur vous ;</li>
              <li>de les faire rectifier s&apos;ils sont inexacts ou incomplets ;</li>
              <li>de retirer votre consentement et d&apos;en demander la suppression ;</li>
              <li>
                de porter plainte auprès de la{" "}
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
              Pour exercer ces droits, écrivez-nous à{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {CONTACT.email}
              </a>
              . Nous répondons dans les 30 jours prévus par la loi.
            </p>
          </Section>

          <Section label="Modifications">
            <p>
              Cette politique peut être mise à jour pour refléter l&apos;évolution du site
              ou de la réglementation ; la date de dernière mise à jour figure en haut de
              page. Pour toute question,{" "}
              <Link
                href="/contact"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                contactez-nous
              </Link>
              .
            </p>
          </Section>
        </div>
      </section>
    </div>
  )
}
