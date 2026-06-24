"use client"

import { useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { useAdmin } from "@/lib/admin-context"
import { RealisationCard } from "@/components/realisations/RealisationCard"
import { ParallaxImage } from "@/components/ui/ParallaxImage"
import { DrawLine } from "@/components/ui/DrawLine"
import { ArrowLink } from "@/components/ui/ArrowLink"

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

// Galerie éditoriale : projet vedette plein cadre + masonry pour le reste.
// La vedette suit l'ordre admin (position) par défaut ; on peut arriver avec
// ?featured=<id> (clic depuis l'accueil) et cliquer un autre projet pour le
// passer en grand. Robuste à N dynamique (N=0 vide, N=1 vedette seule, N≥2).
export function RealisationsGallery() {
  const { realisations } = useAdmin()
  const reduce = useReducedMotion()
  const params = useSearchParams()
  const [featuredId, setFeaturedId] = useState<string | null>(
    params.get("featured"),
  )
  // Which photo of the featured project is shown (hero carousel).
  const [leadImg, setLeadImg] = useState(0)
  const [prevLeadId, setPrevLeadId] = useState<string | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

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

  // Already in the admin-defined order (position) as returned by the API.
  const items = realisations
  const lead = items.find((r) => r.id === featuredId) ?? items[0]
  const rest = items.filter((r) => r.id !== lead.id)

  // Reset the hero photo whenever the featured project changes.
  if (lead.id !== prevLeadId) {
    setPrevLeadId(lead.id)
    setLeadImg(0)
  }

  const leadImages = lead.images.length ? lead.images : [""]
  const currentLeadSrc = leadImages[leadImg] ?? ""
  const prevImg = () =>
    setLeadImg((i) => (i - 1 + leadImages.length) % leadImages.length)
  const nextImg = () => setLeadImg((i) => (i + 1) % leadImages.length)

  const feature = (id: string) => {
    setFeaturedId(id)
    topRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    })
  }

  return (
    <section className="bg-background pb-24 pt-4 md:pb-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Projet vedette (re-anime au changement via key) */}
        <motion.div
          ref={topRef}
          key={lead.id}
          initial={reduce ? undefined : { opacity: 0, scale: 1.02 }}
          animate={reduce ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] border border-border md:aspect-[21/9] md:rounded-[2rem]"
        >
          {/* Photos (fondu enchaîné au changement) */}
          <AnimatePresence initial={false}>
            <motion.div
              key={leadImg}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.4, ease: "easeInOut" }}
            >
              {currentLeadSrc && (
                <ParallaxImage
                  src={currentLeadSrc}
                  alt={lead.name}
                  sizes="100vw"
                  amount={14}
                  unoptimized
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Navigation des photos (si la vedette en a plusieurs) */}
          {leadImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImg}
                aria-label="Photo précédente"
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/35 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60 md:left-5"
              >
                <CaretLeft size={20} weight="bold" />
              </button>
              <button
                type="button"
                onClick={nextImg}
                aria-label="Photo suivante"
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/35 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60 md:right-5"
              >
                <CaretRight size={20} weight="bold" />
              </button>
              <div className="absolute right-4 top-4 z-10 flex gap-1.5 md:right-6 md:top-6">
                {leadImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLeadImg(i)}
                    aria-label={`Voir la photo ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === leadImg
                        ? "w-5 bg-white"
                        : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 md:p-10">
            <h2 className="max-w-[24ch] font-display text-[clamp(1.5rem,4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.01em] text-white">
              {lead.name}
            </h2>
          </div>
        </motion.div>

        {/* Reste — masonry (clic = passe en vedette) */}
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
                <RealisationCard
                  key={r.id}
                  realisation={r}
                  index={i + 1}
                  onSelect={() => feature(r.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
