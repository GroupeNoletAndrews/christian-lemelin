import type { Metadata } from "next"
import { Suspense } from "react"
import { RealisationsGallery } from "@/components/realisations/RealisationsGallery"

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Nos projets en métal — de la cuisine professionnelle à la façade architecturale, fabriqués sur mesure dans nos ateliers à Québec.",
}

export default function RealisationsPage() {
  return (
    <div className="min-h-screen bg-background" data-header-theme="light">
      {/* Hero */}
      <section className="pb-10 pt-40 md:pb-14">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <h1 className="max-w-[16ch] font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.98] tracking-[-0.02em] text-foreground">
            Nos projets en métal.
          </h1>
          <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-foreground-muted">
            De la cuisine professionnelle à la façade architecturale, chaque projet est fabriqué
            sur mesure dans nos ateliers à Québec — inox, acier, aluminium, laiton et cuivre.
          </p>
        </div>
      </section>

      <Suspense>
        <RealisationsGallery />
      </Suspense>
    </div>
  )
}
