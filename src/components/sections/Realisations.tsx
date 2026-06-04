"use client"

import { useAdmin } from "@/lib/admin-context"
import { Eyebrow } from "@/components/ui/Eyebrow"
import { ArrowLink } from "@/components/ui/ArrowLink"
import { RealisationCard } from "@/components/realisations/RealisationCard"

export function Realisations() {
  const { realisations, maxPinned } = useAdmin()
  const pinned = realisations.filter((r) => r.pinned).slice(0, maxPinned)

  return (
    <section data-header-theme="light" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Réalisations</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-foreground">
              Quelques projets récents.
            </h2>
          </div>
          <ArrowLink href="/realisations">Voir tout</ArrowLink>
        </div>

        {/* Uniform grid */}
        {pinned.length > 0 ? (
          <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {pinned.map((r, i) => (
              <RealisationCard key={r.id} realisation={r} index={i} />
            ))}
          </div>
        ) : (
          <p className="mt-14 font-sans text-foreground-muted">
            Aucune réalisation épinglée pour le moment.
          </p>
        )}
      </div>
    </section>
  )
}
