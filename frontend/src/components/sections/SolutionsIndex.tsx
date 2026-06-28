"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "motion/react"
import { ArrowUpRight, X } from "@phosphor-icons/react"
import { SOLUTIONS_OVERVIEW, imageUrl, type SolutionIndexEntry } from "@/content"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { DrawLine } from "@/components/ui/DrawLine"
import { ArrowLink } from "@/components/ui/ArrowLink"
import { cn } from "@/lib/utils"

// Index typographique des catégories de solutions (pattern « sites primés »).
// SURVOL (desktop) : aperçu monochrome qui suit le curseur, les autres noms
// s'estompent, le nom actif glisse. CLIC : plus de navigation — la liste passe
// en colonne étroite et un panneau « onglet » affiche les infos utiles.
//
// IMPORTANT (anti-saccade) : on n'anime JAMAIS de propriété qui reflow
// (width/font-size/height des noms). Le passage compact est INSTANTANÉ (un seul
// reflow) ; seuls le panneau et les micro-interactions s'animent, et uniquement
// via des transforms GPU (opacity / translate) qui ne saccadent pas. Le
// tassement n'a lieu qu'en desktop ; sur mobile c'est un accordéon simple.
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

const PREVIEW_H = 170 // ~moitié de la hauteur de l'aperçu, pour le centrer sur le curseur

const previewV: Variants = {
  initial: { opacity: 0, scale: 0.92, rotate: -2 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 220, damping: 26, mass: 0.7 },
  },
  exit: { opacity: 0, scale: 0.96, rotate: 1, transition: { duration: 0.2, ease: EASE_OUT } },
}

// L'index reçoit la copie utile résolue côté serveur (cf. page.tsx).
export type SolutionItem = SolutionIndexEntry & {
  intro: string
  highlights: { title: string; body?: string }[]
}

// Panneau ouvert : aperçu + intro + points clés + lien contact. Pas de galerie
// ni de blabla superflu — seulement l'essentiel de l'ancienne page de détail.
function SolutionPanel({ item, onClose }: { item: SolutionItem; onClose: () => void }) {
  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border">
        <Image
          src={imageUrl(item.hoverImage, 1100, 700)}
          alt={item.hoverImage.alt}
          fill
          sizes="(min-width: 768px) 55vw, 100vw"
          className="object-cover"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/70"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
        {item.tagline}
      </p>
      <p className="mt-3 max-w-[60ch] leading-relaxed text-foreground">{item.intro}</p>

      {item.highlights.length > 0 && (
        <div className="mt-6">
          {item.highlights.map((h) => (
            <div
              key={h.title}
              className="border-t border-border py-3.5 sm:grid sm:grid-cols-[1fr_1.4fr] sm:gap-5"
            >
              <h3 className="font-display text-base font-medium text-foreground">{h.title}</h3>
              {h.body && (
                <p className="mt-1 text-sm leading-relaxed text-foreground-muted sm:mt-0">
                  {h.body}
                </p>
              )}
            </div>
          ))}
          <div className="border-t border-border" />
        </div>
      )}

      <div className="mt-6">
        <ArrowLink href="/contact">Discutons de votre projet</ArrowLink>
      </div>
    </div>
  )
}

export function SolutionsIndex({ items }: { items?: SolutionItem[] }) {
  // Repli si l'index est rendu sans données dérivées (rétrocompat) : pas de
  // panneau, juste les noms + taglines de l'overview.
  const data: SolutionItem[] =
    items ??
    SOLUTIONS_OVERVIEW.index.map((it) => ({ ...it, intro: it.tagline, highlights: [] }))

  const reduce = useReducedMotion() ?? false
  const canHover = useMediaQuery("(hover: hover)")
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const interactive = canHover && isDesktop && !reduce

  // `useMediaQuery` renvoie `false` au 1er rendu (SSR + hydratation) puis se met
  // à jour après montage — pas besoin de gate `mounted` supplémentaire.
  const params = useSearchParams()
  const [selected, setSelected] = useState<number | null>(() => {
    const s = params.get("s")
    const idx = s ? data.findIndex((it) => it.slug === s) : -1
    return idx >= 0 ? idx : null
  })
  const [hovered, setHovered] = useState<number | null>(null)
  const open = selected != null
  // Le « tassement » (colonne étroite + noms réduits) n'a lieu qu'en desktop.
  const compact = open && isDesktop

  const wrapRef = useRef<HTMLDivElement>(null)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 150, damping: 20, mass: 0.6 })
  const y = useSpring(my, { stiffness: 150, damping: 20, mass: 0.6 })

  const onMove = (e: React.MouseEvent) => {
    if (!interactive || !wrapRef.current) return
    const r = wrapRef.current.getBoundingClientRect()
    mx.set(e.clientX - r.left + 28)
    my.set(e.clientY - r.top - PREVIEW_H)
  }

  // Reflète la sélection dans l'URL (?s=slug) sans re-render ni navigation —
  // partageable, retour arrière propre.
  const syncUrl = (next: number | null) => {
    const url = new URL(window.location.href)
    if (next == null) url.searchParams.delete("s")
    else url.searchParams.set("s", data[next].slug)
    window.history.replaceState(null, "", url)
  }
  const toggle = (i: number) => {
    const next = selected === i ? null : i
    setSelected(next)
    setHovered(null)
    syncUrl(next)
  }
  const close = () => {
    setSelected(null)
    syncUrl(null)
  }

  const hoverItem = hovered != null ? data[hovered] : null
  const selectedItem = selected != null ? data[selected] : null

  return (
    <section data-header-theme="light" className="bg-background">
      <div
        ref={wrapRef}
        onMouseMove={onMove}
        onMouseLeave={() => setHovered(null)}
        className="relative mx-auto max-w-[1600px] px-6 py-16 md:px-12 md:py-24"
      >
        {/* Aperçu flottant suiveur de curseur — desktop, survol, onglet fermé */}
        {interactive && !open && (
          <motion.div
            aria-hidden
            style={{ x, y }}
            className="pointer-events-none absolute left-0 top-0 z-20 w-[clamp(14rem,18vw,18rem)]"
          >
            <AnimatePresence mode="popLayout">
              {hoverItem && (
                <motion.div
                  key={hoverItem.slug}
                  variants={previewV}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border shadow-2xl shadow-black/20"
                >
                  <Image
                    src={imageUrl(hoverItem.hoverImage, 800, 1000)}
                    alt={hoverItem.title}
                    fill
                    sizes="18vw"
                    className="object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="relative z-10 flex flex-col gap-10 md:flex-row md:items-start md:gap-12">
          {/* Liste des noms — la largeur/taille changent INSTANTANÉMENT (pas de
              transition sur des props qui reflow → aucune saccade). */}
          <ul className={cn("w-full", compact ? "md:w-[38%]" : "md:w-full")}>
            {data.map((it, i) => {
              const isSel = selected === i
              const dim = interactive && (open ? !isSel : hovered != null && hovered !== i)
              const active = open ? isSel : hovered === i
              const shift = interactive && active ? 14 : 0
              return (
                <li key={it.slug}>
                  <DrawLine delay={i * 0.06} />
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    onMouseEnter={() => interactive && !open && setHovered(i)}
                    onFocus={() => !open && setHovered(i)}
                    onBlur={() => setHovered(null)}
                    aria-expanded={isSel}
                    className="group flex w-full items-center gap-5 py-5 text-left md:gap-8 md:py-8"
                  >
                    {!interactive && (
                      <span className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border">
                        <Image
                          src={imageUrl(it.hoverImage, 220, 220)}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-balance font-display font-medium leading-[1.0] tracking-[-0.02em] transition-colors duration-300",
                          compact
                            ? "text-[clamp(1.35rem,2.4vw,2rem)]"
                            : "text-[clamp(1.75rem,7vw,4.75rem)]",
                          dim ? "text-foreground/30" : "text-foreground",
                        )}
                      >
                        {/* translate = transform GPU, jamais saccadé */}
                        <motion.span
                          className="inline-block will-change-transform"
                          animate={{ x: shift }}
                          transition={{ type: "spring", stiffness: 320, damping: 32 }}
                        >
                          {it.title}
                        </motion.span>
                      </span>
                      {!compact && (
                        <span
                          className={cn(
                            "mt-2 block max-w-[52ch] text-sm leading-relaxed text-foreground-muted transition-opacity duration-300 md:text-base",
                            dim ? "opacity-40" : "opacity-100",
                          )}
                        >
                          {it.tagline}
                        </span>
                      )}
                    </span>
                    <ArrowUpRight
                      size={28}
                      weight="bold"
                      className={cn(
                        "shrink-0 text-accent transition-all duration-300",
                        isSel && "rotate-45",
                        interactive && !open
                          ? hovered === i
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-2 opacity-0"
                          : "opacity-100",
                      )}
                    />
                  </button>

                  {/* Panneau inline (mobile / tactile) — fondu + léger translate,
                      pas d'animation de hauteur (qui saccaderait). */}
                  <AnimatePresence initial={false}>
                    {isSel && !isDesktop && (
                      <motion.div
                        key="panel-mobile"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: reduce ? 0 : 0.28, ease: EASE_OUT }}
                      >
                        <div className="pb-8 pt-2">
                          <SolutionPanel item={it} onClose={() => toggle(i)} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
            <DrawLine delay={data.length * 0.06} />
          </ul>

          {/* Panneau latéral (desktop) — la boîte reste montée tant qu'un onglet
              est ouvert ; seul le CONTENU se fond au changement (opacity/translate
              uniquement). */}
          <AnimatePresence>
            {compact && selectedItem && (
              <motion.aside
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: reduce ? 0 : 0.3, ease: EASE_OUT }}
                className="md:sticky md:top-28 md:flex-1"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedItem.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: reduce ? 0 : 0.22, ease: EASE_OUT }}
                  >
                    <SolutionPanel item={selectedItem} onClose={close} />
                  </motion.div>
                </AnimatePresence>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
