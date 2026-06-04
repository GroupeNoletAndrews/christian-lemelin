"use client"

import Link from "next/link"
import { useAdmin } from "@/lib/admin-context"
import { Eyebrow } from "@/components/ui/Eyebrow"
import { RealisationCard } from "@/components/realisations/RealisationCard"

export default function RealisationsPage() {
  const { realisations } = useAdmin()

  return (
    <div className="min-h-screen bg-background" data-header-theme="light">
      {/* Hero */}
      <section className="border-b border-border bg-surface pt-40 pb-20">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <Eyebrow>Réalisations</Eyebrow>
          <h1 className="mt-6 max-w-[16ch] font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.98] tracking-[-0.02em] text-foreground">
            Nos projets en métal.
          </h1>
          <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-foreground-muted">
            De la cuisine professionnelle à la façade architecturale, chaque
            projet est fabriqué sur mesure dans nos ateliers à Québec — inox,
            acier, aluminium, laiton et cuivre.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          {realisations.length > 0 ? (
            <>
              <div className="mb-10 flex items-baseline justify-between gap-4 border-b border-border pb-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                  Tous les projets
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                  {String(realisations.length).padStart(2, "0")}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {realisations.map((r, i) => (
                  <RealisationCard key={r.id} realisation={r} index={i} />
                ))}
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="font-sans text-xl text-foreground">
                Aucune réalisation pour le moment
              </p>
              <p className="mt-2 font-sans text-foreground-muted">
                Revenez bientôt pour découvrir nos projets récents.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-ink px-6 py-24 text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Eyebrow dark>Votre projet</Eyebrow>
          <h2 className="mt-6 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-white">
            Un projet en métal en tête?
          </h2>
          <p className="mt-5 max-w-[48ch] font-sans text-white/60">
            Parlez-nous de votre projet. Notre équipe technique vous répond dans
            les 24 heures.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center rounded-full bg-accent px-7 py-3.5 font-sans text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.99]"
          >
            Nous joindre
          </Link>
        </div>
      </section>
    </div>
  )
}
