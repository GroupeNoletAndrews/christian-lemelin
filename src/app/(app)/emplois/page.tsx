import type { Metadata } from "next"
import { JobAccordion } from "@/components/emplois/JobAccordion"
import { ContactCTA } from "@/components/sections/ContactCTA"

export const metadata: Metadata = {
  title: "Emplois",
  description:
    "Rejoignez Entreprises Christian Lemelin et façonnez votre avenir dans la fabrication métallique sur mesure à Québec. Découvrez nos postes ouverts.",
}

export default function EmploisPage() {
  return (
    <div className="bg-background" data-header-theme="light">
      {/* Hero */}
      <section className="pb-6 pt-40 md:pb-10">
        <div className="mx-auto max-w-[1100px] px-6">
          <h1 className="max-w-[16ch] font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-foreground">
            Rejoignez notre équipe.
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-foreground-muted">
            Découvrez nos offres d&apos;emploi et prenez part à l&apos;aventure chez Entreprises
            Christian Lemelin.
          </p>
        </div>
      </section>

      <JobAccordion />

      {/* Rejoignez E.C. Lemelin — bloc éditorial sombre */}
      <section data-header-theme="dark" className="bg-background px-3 py-3 md:px-4 md:py-4">
        <div className="overflow-hidden rounded-[1.75rem] bg-ink px-6 py-16 md:rounded-[2.5rem] md:px-16 md:py-24">
          <h2 className="max-w-[16ch] font-display text-[clamp(2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-white">
            Rejoignez E.C. Lemelin et façonnez votre avenir.
          </h2>
          <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-white/65">
            Vous valorisez votre expertise et votre engagement ? Chez Entreprises Christian Lemelin,
            nous vous offrons l&apos;opportunité de repousser les limites de l&apos;innovation et
            d&apos;exercer pleinement votre savoir-faire.
          </p>
        </div>
      </section>

      <ContactCTA
        heading="Vous n'avez pas trouvé ce que vous cherchez ?"
        body="Envoyez-nous votre CV et votre profil professionnel. Nous gardons les candidatures intéressantes pour les futures opportunités."
        label="Nous contacter"
        href="/contact"
      />
    </div>
  )
}
