"use client"

// ──────────────────────────────────────────────────────────────────────────
// PRESERVED VARIANT — interactive 3D model with 4 anchored hotspots that drive
// the side cards. Kept for later reuse; NOT mounted on the home page right now
// (the live Solutions section uses the points-free, enlarged GLB instead).
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Plus, X } from "@phosphor-icons/react/dist/ssr"
import { ArrowLink } from "@/components/ui/ArrowLink"
import type { Hotspot } from "@/components/ui/SolutionsModel"

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
  position: [number, number, number]
}

const sectors: Sector[] = [
  {
    id: "restauration",
    title: "Restauration & hôtellerie",
    description:
      "Comptoirs, hottes et équipements en inox sur mesure pour les cuisines professionnelles les plus exigeantes.",
    href: "/solutions",
    position: [0.28, 0.6, 0.18],
  },
  {
    id: "architecture",
    title: "Architecture & design",
    description:
      "Rampes, balustrades et panneaux décoratifs en inox, laiton et cuivre pour les projets d'exception.",
    href: "/solutions",
    position: [-0.78, 0.04, 1.12],
  },
  {
    id: "industrie",
    title: "Industrie & manufacturier",
    description:
      "Pièces de précision, gabarits, structures et composants pour la production industrielle.",
    href: "/solutions",
    position: [1.05, 0.12, -0.18],
  },
  {
    id: "commercial",
    title: "Commercial & institutionnel",
    description:
      "Signalétique, mobilier métallique et plafonds pour les espaces commerciaux et bâtiments institutionnels.",
    href: "/solutions",
    position: [0.5, -0.3, 1.15],
  },
]

const hotspots: Hotspot[] = sectors.map((s, i) => ({
  id: s.id,
  index: i + 1,
  title: s.title,
  position: s.position,
}))

export function SolutionsHotspots() {
  const reduce = useReducedMotion() ?? false
  // One card is open by default — "un des textes affiché préalablement".
  const [activeId, setActiveId] = useState<string | null>(sectors[0].id)
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

  const compact = activeId !== null
  const select = (id: string) =>
    setActiveId((cur) => (cur === id ? null : id))

  const spring = { type: "spring" as const, stiffness: 220, damping: 32 }

  return (
    <section
      data-header-theme="dark"
      className="bg-ink py-24 text-white md:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-[16ch] font-display text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-white">
            Un secteur, ses exigences.
          </h2>
          <p className="max-w-[42ch] leading-relaxed text-white/55">
            Pivotez la pièce, explorez quatre points de contact. Chaque secteur
            a ses contraintes — nous les connaissons toutes.
          </p>
        </div>

        {/* Interactive stage + panel */}
        <div className="mt-12 flex flex-col gap-4 md:mt-16 md:flex-row md:gap-0">
          {/* Stage */}
          <motion.div
            layout={!reduce}
            transition={spring}
            className="relative h-[56vh] min-h-[420px] min-w-0 flex-1 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent md:h-[clamp(520px,62vh,680px)]"
          >
            {/* soft radial backdrop for depth */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_50%_18%,rgba(0,72,249,0.10),transparent_60%)]"
            />
            {mounted && (
              <SolutionsModel
                hotspots={hotspots}
                activeId={activeId}
                onSelect={select}
                compact={compact}
                shiftX={isDesktop}
                reduce={reduce}
              />
            )}

            {/* drag hint */}
            <AnimatePresence>
              {!activeId && !reduce && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="pointer-events-none absolute bottom-5 left-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45"
                >
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  Glissez pour pivoter
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Panel */}
          <AnimatePresence initial={false} mode="popLayout">
            {activeId && (
              <motion.aside
                key="panel"
                layout={!reduce}
                initial={
                  isDesktop
                    ? { width: 0, opacity: 0 }
                    : { height: 0, opacity: 0 }
                }
                animate={
                  isDesktop
                    ? { width: "auto", opacity: 1 }
                    : { height: "auto", opacity: 1 }
                }
                exit={
                  isDesktop
                    ? { width: 0, opacity: 0 }
                    : { height: 0, opacity: 0 }
                }
                transition={spring}
                className="relative shrink-0 overflow-hidden md:ml-6"
              >
                <div className="w-full md:w-[clamp(20rem,30vw,27rem)]">
                  <Panel
                    activeId={activeId}
                    onSelect={setActiveId}
                    onClose={() => setActiveId(null)}
                    reduce={reduce}
                  />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/* ── Side / bottom panel: four accordion cards, the active one expanded ───── */
function Panel({
  activeId,
  onSelect,
  onClose,
  reduce,
}: {
  activeId: string
  onSelect: (id: string) => void
  onClose: () => void
  reduce: boolean
}) {
  const activeIndex = sectors.findIndex((s) => s.id === activeId)

  return (
    <div className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 md:h-[clamp(520px,62vh,680px)] md:p-8">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
          {String(activeIndex + 1).padStart(2, "0")} — {String(sectors.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le panneau"
          className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
        >
          <X size={14} weight="bold" />
        </button>
      </div>

      <div className="mt-6 flex flex-col">
        {sectors.map((s, i) => {
          const open = s.id === activeId
          return (
            <div
              key={s.id}
              className="border-t border-white/10 last:border-b"
            >
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                className="group flex w-full items-center gap-4 py-4 text-left"
              >
                <span className="font-mono text-[11px] tabular-nums tracking-[0.1em] text-white/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`flex-1 font-display text-[17px] font-medium leading-snug transition-colors ${
                    open ? "text-white" : "text-white/65 group-hover:text-white"
                  }`}
                >
                  {s.title}
                </span>
                <Plus
                  size={15}
                  weight="bold"
                  className={`shrink-0 transition-transform duration-300 ${
                    open ? "rotate-45 text-accent" : "text-white/45 group-hover:text-white"
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
                    <div className="pb-5 pl-9 pr-2">
                      <p className="max-w-[42ch] text-[15px] leading-relaxed text-white/60">
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
    </div>
  )
}
