"use client"

import { motion, useReducedMotion } from "motion/react"
import { useAdmin } from "@/lib/admin-context"
import { RealisationCard } from "@/components/realisations/RealisationCard"
import { ParallaxImage } from "@/components/ui/ParallaxImage"
import { DrawLine } from "@/components/ui/DrawLine"
import { ArrowLink } from "@/components/ui/ArrowLink"

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

// Galerie éditoriale : projet vedette plein cadre + masonry pour le reste.
// Robuste à un nombre N dynamique (contexte admin / localStorage, hydraté après
// mount) : gère N=0 (état vide), N=1 (vedette seule), N≥2 (vedette + masonry).
export function RealisationsGallery() {
  const { realisations } = useAdmin()
  const reduce = useReducedMotion()

  if (realisations.length === 0) {
    return (
      <section className="bg-background py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-[-0.01em] text-foreground">
            Aucune réalisation pour le moment.
          </h2>
          <p className="mt-4 max-w-[48ch] leading-relaxed text-foreground-muted">
            Revenez bientôt pour découvrir nos projets récents — ou parlez-nous du vôtre.
          </p>
          <ArrowLink href="/contact" className="mt-6 text-lg">
            Démarrer un projet
          </ArrowLink>
        </div>
      </section>
    )
  }

  const items = [...realisations].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )
  const lead = items[0]
  const rest = items.slice(1)
  const leadCover = lead.images[0] || ""

  return (
    <section className="bg-background pb-24 pt-4 md:pb-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Projet vedette */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, scale: 1.02 }}
          animate={reduce ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] border border-border md:aspect-[21/9] md:rounded-[2rem]"
        >
          {leadCover && (
            <ParallaxImage
              src={leadCover}
              alt={lead.name}
              sizes="100vw"
              amount={14}
              unoptimized
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <h2 className="max-w-[24ch] font-display text-[clamp(1.5rem,4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.01em] text-white">
              {lead.name}
            </h2>
          </div>
        </motion.div>

        {/* Reste — masonry */}
        {rest.length > 0 && (
          <>
            <div className="mb-10 mt-16 flex items-baseline justify-between gap-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                Tous les projets
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                {String(items.length).padStart(2, "0")}
              </p>
            </div>
            <DrawLine className="mb-10" />
            <div className="gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
              {rest.map((r, i) => (
                <RealisationCard key={r.id} realisation={r} index={i + 1} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
