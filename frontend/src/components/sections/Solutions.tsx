"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Plus, CaretRight, CaretLeft } from "@phosphor-icons/react/dist/ssr"
import { ArrowLink } from "@/components/ui/ArrowLink"

const SolutionsModel = dynamic(
  () => import("@/components/ui/SolutionsModel").then((m) => m.SolutionsModel),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center">
        <span className="animate-pulse font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
          Chargement du modèle…
        </span>
      </div>
    ),
  },
)

type Sector = {
  id: string
  title: string
  description: string
  href: string
}

const sectors: Sector[] = [
  {
    id: "restauration",
    title: "Restauration & hôtellerie",
    description:
      "Comptoirs, hottes et équipements en inox sur mesure pour les cuisines professionnelles les plus exigeantes.",
    href: "/solutions",
  },
  {
    id: "architecture",
    title: "Architecture & design",
    description:
      "Rampes, balustrades et panneaux décoratifs en inox, laiton et cuivre pour les projets d'exception.",
    href: "/solutions",
  },
  {
    id: "industrie",
    title: "Industrie & manufacturier",
    description:
      "Pièces de précision, gabarits, structures et composants pour la production industrielle.",
    href: "/solutions",
  },
  {
    id: "commercial",
    title: "Commercial & institutionnel",
    description:
      "Signalétique, mobilier métallique et plafonds pour les espaces commerciaux et bâtiments institutionnels.",
    href: "/solutions",
  },
]

const spring = { type: "spring" as const, stiffness: 260, damping: 30 }

export function Solutions() {
  const reduce = useReducedMotion() ?? false
  const [activeId, setActiveId] = useState<string | null>(sectors[0].id)
  const [panelOpen, setPanelOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia("(min-width: 768px)")
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const toggleCard = (id: string) =>
    setActiveId((cur) => (cur === id ? null : id))

  // Desktop model cedes room when the overlay panel is open; idle-spins otherwise.
  // On mobile the tabs live outside the viewer, so the model never compacts.
  const compact = isDesktop && panelOpen

  return (
    <section
      data-header-theme="dark"
      className="bg-background px-3 py-3 text-white md:px-4 md:py-4"
    >
      {/* Rounded inset viewer — the cream page background shows around the
          corners, matching the SavoirFaire block. Everything lives inside it. */}
      <div className="relative h-[58vh] min-h-[420px] w-full overflow-hidden rounded-[1.75rem] bg-ink md:h-[92vh] md:rounded-[2.5rem]">
        {/* depth glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 [background:radial-gradient(70%_60%_at_50%_42%,rgba(0,72,249,0.13),transparent_70%)]"
        />

        {/* 3D model */}
        {mounted && (
          <div className="absolute inset-0 z-0">
            <SolutionsModel
              hotspots={[]}
              activeId={activeId}
              onSelect={() => {}}
              compact={compact}
              shiftX={false}
              fitScale={isDesktop ? 3.7 : 2.4}
              liftFactor={isDesktop ? 0.1 : 0.1}
              autoRotate={!compact}
              reduce={reduce}
            />
          </div>
        )}

        {/* legibility scrims — left column, plus bottom (desktop title) & top (mobile title / hint) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 [background:linear-gradient(100deg,rgba(17,17,17,0.9)_0%,rgba(17,17,17,0.45)_24%,rgba(17,17,17,0.08)_46%,transparent_58%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 [background:linear-gradient(0deg,rgba(17,17,17,0.8),rgba(17,17,17,0.12)_55%,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-2/5 [background:linear-gradient(180deg,rgba(17,17,17,0.6),transparent)]"
        />

        {/* "Glissez pour pivoter" — larger, top-left */}
        {!reduce && (
          <div className="pointer-events-none absolute left-6 top-6 z-20 flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.2em] text-white/55 md:left-14 md:top-12 md:text-[13px]">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
            Glissez pour pivoter
          </div>
        )}

        {/* Title + intro overlay — bottom-left */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-6 pb-12 md:px-14 md:pb-16">
          <h2 className="max-w-[15ch] font-display text-[clamp(2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-white">
            Un secteur, ses exigences.
          </h2>
          <p className="mt-4 max-w-[42ch] leading-relaxed text-white/75">
            De la cuisine professionnelle à la façade architecturale, chaque
            secteur a ses contraintes. Nous les connaissons toutes.
          </p>
        </div>

        {/* Desktop: collapsible opaque sector panel inside the viewer */}
        {isDesktop && (
          <>
            <AnimatePresence>
              {panelOpen && (
                <motion.aside
                  key="panel"
                  initial={reduce ? { opacity: 0 } : { x: 36, opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { x: 0, opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { x: 36, opacity: 0 }}
                  transition={spring}
                  className="absolute right-5 top-1/2 z-30 flex max-h-[82%] w-[clamp(20rem,24vw,23rem)] -translate-y-1/2 flex-col rounded-2xl border border-white/10 bg-ink/90 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Secteurs
                    </span>
                    <button
                      type="button"
                      onClick={() => setPanelOpen(false)}
                      aria-label="Masquer les secteurs"
                      className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
                    >
                      <CaretRight size={14} weight="bold" />
                    </button>
                  </div>
                  <div className="overflow-y-auto">
                    <SectorTabs
                      activeId={activeId}
                      onToggle={toggleCard}
                      reduce={reduce}
                    />
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!panelOpen && (
                <motion.button
                  key="handle"
                  type="button"
                  onClick={() => setPanelOpen(true)}
                  initial={reduce ? { opacity: 0 } : { x: 28, opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { x: 0, opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { x: 28, opacity: 0 }}
                  transition={spring}
                  className="absolute right-5 top-1/2 z-30 flex -translate-y-1/2 items-center gap-2 rounded-full border border-white/15 bg-ink/85 px-4 py-3 backdrop-blur-xl transition-colors hover:border-white/30"
                >
                  <CaretLeft size={14} weight="bold" className="text-accent" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">
                    Secteurs
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Mobile: sector tabs OUTSIDE the viewer — a clean stacked dark card */}
      {!isDesktop && (
        <div className="mt-3 rounded-[1.75rem] border border-white/10 bg-ink p-5">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
            Secteurs
          </span>
          <div className="mt-2">
            <SectorTabs activeId={activeId} onToggle={toggleCard} reduce={reduce} />
          </div>
        </div>
      )}
    </section>
  )
}

/* ── Sector accordion (shared) ────────────────────────────────────────────── */
function SectorTabs({
  activeId,
  onToggle,
  reduce,
}: {
  activeId: string | null
  onToggle: (id: string) => void
  reduce: boolean
}) {
  return (
    <div className="flex flex-col">
      {sectors.map((s) => {
        const open = s.id === activeId
        return (
          <div key={s.id} className="border-t border-white/12 last:border-b">
            <button
              type="button"
              onClick={() => onToggle(s.id)}
              aria-expanded={open}
              className="group flex w-full items-center gap-4 py-4 text-left"
            >
              <span
                className={`flex-1 font-display text-[18px] font-medium leading-snug transition-colors duration-300 ${
                  open ? "text-white" : "text-white/60 group-hover:text-white"
                }`}
              >
                {s.title}
              </span>
              <Plus
                size={16}
                weight="bold"
                className={`shrink-0 transition-all duration-300 ${
                  open ? "rotate-45 text-accent" : "text-white/40 group-hover:text-white"
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={reduce ? undefined : { height: 0, opacity: 0 }}
                  animate={reduce ? undefined : { height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-5 pr-2">
                    <p className="max-w-[40ch] text-[15px] leading-relaxed text-white/60">
                      {s.description}
                    </p>
                    <ArrowLink href={s.href} dark className="mt-4">
                      Explorer ce secteur
                    </ArrowLink>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
