"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { createPortal } from "react-dom"
import { useSearchParams } from "next/navigation"
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion"
import { ArrowUpRight, Plus, X } from "@phosphor-icons/react"
import { SOLUTIONS_OVERVIEW, imageUrl, type SolutionIndexEntry } from "@/content"
import { useLenis } from "@/components/providers/LenisProvider"
import { hoverSlot } from "@/lib/sections-registry"
import { PLACEHOLDER_SRC } from "@/lib/media"
import { useSlotOverride, useSlotStyleOverride } from "@/lib/section-preview"
import { usePublishedSlotStyle } from "@/components/sections/SectionStyle"
import { slotImgCss, type SlotStyle } from "@/lib/section-style"
import { SlotImage } from "@/components/sections/SlotImage"
import { ImagePlaceholder } from "@/components/sections/ImagePlaceholder"

// /solutions — refonte « from scratch » façon skiper-ui « skiper19 »
// (stroke-follows-scroll), réinterprétée pour notre contenu :
//
//   • SCÈNE ÉPINGLÉE (sticky) : tout se joue AU CENTRE de l'écran.
//   • UNE ligne accent ÉPAISSE et CENTRÉE se dessine au scroll ; sa TÊTE
//     lumineuse est MAINTENUE au milieu du viewport (la « pellicule » défile
//     dessous → on voit toujours le trait se tracer au centre).
//   • Les SOLUTIONS apparaissent ET disparaissent en fondu, de part et d'autre
//     de la ligne (alternance gauche/droite), en TAILLES VARIÉES, au fur et à
//     mesure que la tête atteint puis dépasse leur nœud.
//
// Repère SVG calé sur les PIXELS (viewBox = taille mesurée, 1:1) → trait net,
// longueurs exactes, tête posée pile sur le tracé. Le scrubbing (dessin, défilé
// de la pellicule, fondu des cartes) est appliqué IMPÉRATIVEMENT au DOM via refs
// dans place() — AUCUN composant `motion` lié à une MotionValue de scroll (sinon
// framer-motion v12 lève une erreur WAAPI au montage). Voir DESIGN.md.

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]
const noopSubscribe = () => () => {}

const MOBILE_BP = 760
const THICK = 18 // épaisseur du trait (px). « Beaucoup beaucoup plus épais ».
// Géométrie verticale de la pellicule, en fractions de hauteur d'écran (vh).
const TOP_PAD = 0.55
const NODE_GAP = 0.78 // espacement vertical des cartes (vh) — rapprochées.
const BOT_PAD = 0.55
// Fenêtre d'apparition/disparition d'une carte autour de la tête (en vh).
const FADE_FULL = 0.12 // < cette distance → carte pleinement visible
const FADE_OUT = 0.62 // > cette distance → carte invisible

export type SolutionItem = SolutionIndexEntry & {
  intro: string
  highlights: { title: string; body?: string }[]
}

// Résout l'image d'aperçu d'une solution en respectant, dans l'ordre : l'override
// mis en scène dans l'aperçu de l'admin (postMessage), l'override publié en base
// (prop `images` via resolveSectionImages), puis le défaut seed baké dans le code.
// Retourne "" quand le proprio n'a pas encore mis de photo (sentinelle prod
// PLACEHOLDER_SRC) → l'appelant affiche <ImagePlaceholder /> à la place de l'image.
function useHoverSrc(
  item: SolutionItem,
  images: Record<string, string>,
  w: number,
  h: number,
): { src: string; style: SlotStyle | null } {
  const slot = hoverSlot(item.slug)
  const staged = useSlotOverride("solutions", slot)
  const styleOverride = useSlotStyleOverride("solutions", slot)
  const published = usePublishedSlotStyle(slot)
  const style = styleOverride ?? published ?? null
  const resolved = staged ?? images[slot]
  if (resolved === PLACEHOLDER_SRC) return { src: "", style }
  if (resolved) return { src: resolved, style }
  return { src: imageUrl(item.hoverImage, w, h), style }
}

// Tailles variées (max-width px + ratio d'image) — « plus petites / plus grosses ».
const CARD_SIZES = [
  { max: 680, ratio: "4 / 3" },
  { max: 500, ratio: "5 / 4" },
  { max: 620, ratio: "16 / 10" },
  { max: 540, ratio: "4 / 3" },
  { max: 660, ratio: "16 / 11" },
  { max: 560, ratio: "5 / 4" },
]

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

// Tracé vertical lisse (tangentes verticales aux nœuds → ondulation douce), en
// coordonnées PIXELS. Le trait bulge du côté OPPOSÉ à la carte (colonne vide à
// cette hauteur) → la carte garde tout son espace, le trait ne la traverse pas.
function buildPath(w: number, trackH: number, cx: number, amp: number, nodeYs: number[]) {
  if (!w || !trackH || nodeYs.length === 0) return ""
  const pts: [number, number][] = [[cx, 0]]
  nodeYs.forEach((y, i) => {
    const dir = i % 2 === 0 ? -1 : 1
    pts.push([cx + dir * amp, y])
  })
  pts.push([cx, trackH])

  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const dy = y1 - y0
    const c1y = y0 + dy * 0.5
    const c2y = y1 - dy * 0.5
    d += ` C ${x0.toFixed(2)} ${c1y.toFixed(2)} ${x1.toFixed(2)} ${c2y.toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`
  }
  return d
}

// ── Zoom morphant ────────────────────────────────────────────────────────────
// Au clic, l'image de la carte « s'ouvre » en plein cadre (morph partagé par
// layoutId `sol-<slug>` : même nœud source dans la carte, cible ici) puis les
// infos MINIMALES se révèlent. Pas de superflu : numéro, titre, intro, contact.
const SPRING = { type: "spring" as const, bounce: 0.04, duration: 0.55 }

function SolutionZoom({
  item,
  images,
  reduce,
  onClose,
}: {
  item: SolutionItem
  images: Record<string, string>
  reduce: boolean
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const { src, style } = useHoverSrc(item, images, 2000, 1300)
  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[100]"
      data-lenis-prevent
    >
      {/* Fond noir (couvre la page pendant/après le morph). */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Image VRAIMENT plein écran. Le conteneur morphe depuis la carte
          (layoutId) → on « entre » dans la carte ; l'image interne pousse
          ensuite lentement (push-in = on s'enfonce dedans), à un rythme distinct
          du texte qui monte → effet de parallaxe/profondeur. */}
      <motion.div
        layoutId={reduce ? undefined : `sol-${item.slug}`}
        initial={reduce ? { opacity: 0 } : false}
        animate={reduce ? { opacity: 1 } : undefined}
        exit={reduce ? { opacity: 0 } : undefined}
        transition={reduce ? { duration: 0.4, ease: EASE_OUT } : SPRING}
        className="absolute inset-0 overflow-hidden"
      >
        {src ? (
          <motion.img
            initial={{ scale: reduce ? 1.05 : 1 }}
            animate={{ scale: reduce ? 1 : 1.12 }}
            transition={{ duration: reduce ? 0.4 : 9, ease: reduce ? EASE_OUT : "easeOut" }}
            src={src}
            alt={item.hoverImage.alt}
            draggable={false}
            className="h-full w-full object-cover"
            // Only the focal point here — the cinematic push-in owns `transform`.
            style={style?.objectPosition ? { objectPosition: style.objectPosition } : undefined}
          />
        ) : (
          <ImagePlaceholder />
        )}
      </motion.div>

      {/* Voile dégradé pour la lisibilité du texte en bas. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/40"
      />

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-5 top-5 z-10 grid size-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur-md transition-colors hover:bg-white/25 sm:right-8 sm:top-8"
      >
        <X size={20} weight="bold" />
      </button>

      {/* Infos minimales, en surimpression. */}
      <motion.div
        initial={{ opacity: 0, y: 56 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: EASE_OUT, delay: reduce ? 0 : 0.28 }}
        className="absolute inset-x-0 bottom-0 z-10 p-7 text-white sm:p-12"
      >
        <h2 className="max-w-[18ch] font-display text-[clamp(2rem,5vw,3.75rem)] font-medium leading-[1.03] tracking-[-0.02em]">
          {item.title}
        </h2>
        <p className="mt-4 max-w-[58ch] leading-relaxed text-white/75">{item.intro}</p>
        <a
          href="/contact"
          className="mt-7 inline-flex items-center gap-2 font-medium text-white underline-offset-4 hover:underline"
        >
          Discutons de votre projet
          <ArrowUpRight size={20} weight="bold" />
        </a>
      </motion.div>
    </motion.div>
  )
}

// ── Carte solution (contenu) ────────────────────────────────────────────────
function SolutionCard({
  item,
  images,
  ratio,
  align,
  onOpen,
}: {
  item: SolutionItem
  images: Record<string, string>
  ratio: string
  align: "left" | "right"
  onOpen: () => void
}) {
  const end = align === "right"
  const { src, style } = useHoverSrc(item, images, 1000, 760)
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group block w-full text-left"
    >
      <span
        className="relative block w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/[0.10]"
        style={{ aspectRatio: ratio }}
      >
        {/* Conteneur source du morph (layoutId partagé avec le zoom plein cadre). */}
        <motion.div layoutId={`sol-${item.slug}`} className="absolute inset-0">
          {src ? (
            <motion.img
              src={src}
              alt={item.hoverImage.alt}
              draggable={false}
              className="h-full w-full object-cover grayscale transition-[filter] duration-700 ease-out group-hover:grayscale-0"
              style={slotImgCss(style)}
            />
          ) : (
            <ImagePlaceholder />
          )}
        </motion.div>
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors group-hover:bg-accent">
          <Plus size={18} weight="bold" />
        </span>
      </span>

      <span
        className={`mt-5 block font-display text-[clamp(1.6rem,2.8vw,2.6rem)] font-medium leading-[1.08] tracking-[-0.02em] text-foreground ${end ? "text-right" : ""}`}
      >
        {item.title}
      </span>
      <span
        className={`mt-2 block max-w-[42ch] leading-relaxed text-foreground-muted ${end ? "ml-auto text-right" : ""}`}
      >
        {item.tagline}
      </span>
      <span
        className={`mt-4 inline-flex items-center gap-2 font-medium text-foreground ${end ? "flex-row-reverse" : ""}`}
      >
        Découvrir cette solution
        <ArrowUpRight size={20} weight="bold" className="text-accent" />
      </span>
    </button>
  )
}

// ── Repli reduced-motion : liste simple ─────────────────────────────────────
function SimpleList({
  data,
  images,
  onOpen,
}: {
  data: SolutionItem[]
  images: Record<string, string>
  onOpen: (i: number) => void
}) {
  return (
    <section id="solutions" data-header-theme="light" className="bg-background">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-6 py-16 sm:grid-cols-2 md:px-10">
        {data.map((it, i) => (
          <button
            key={it.slug}
            type="button"
            onClick={() => onOpen(i)}
            aria-haspopup="dialog"
            className="group block w-full text-left"
          >
            <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface">
              <SlotImage
                section="solutions"
                slot={hoverSlot(it.slug)}
                src={images[hoverSlot(it.slug)] ?? imageUrl(it.hoverImage, 900, 675)}
                alt={it.hoverImage.alt}
                sizes="(min-width: 640px) 50vw, 100vw"
                grayscale
                className="object-cover"
              />
            </span>
            <span className="mt-3 block font-display text-2xl font-medium text-foreground">{it.title}</span>
            <span className="mt-1 block text-sm leading-relaxed text-foreground-muted">{it.tagline}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

// ── Section principale ──────────────────────────────────────────────────────
export function SolutionsTimeline({
  items,
  images = {},
}: {
  items?: SolutionItem[]
  /** Overrides d'images publiés/mis en scène, par slot (resolveSectionImages). */
  images?: Record<string, string>
}) {
  const data: SolutionItem[] =
    items ??
    SOLUTIONS_OVERVIEW.index.map((it) => ({ ...it, intro: it.tagline, highlights: [] }))
  const n = data.length
  // Hauteur de scène = scroll alloué : ~1 écran par solution + entrée/sortie.
  const SCENE_VH = (n + 1) * 76

  const reduce = useReducedMotion() ?? false
  const lenis = useLenis()

  const ref = useRef<HTMLElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const totalLenRef = useRef(0)
  const vhRef = useRef(0)
  const trackPxRef = useRef(0)
  const nodeYsRef = useRef<number[]>([])

  // Dimensions du viewport (= scène sticky). 1 unité SVG = 1 px.
  const [dims, setDims] = useState({ vw: 0, vh: 0 })
  const isMobile = dims.vw > 0 && dims.vw < MOBILE_BP

  const trackPx = dims.vh ? (TOP_PAD + (n - 1) * NODE_GAP + BOT_PAD) * dims.vh : 0
  const nodeYs = useMemo(
    () => (dims.vh ? data.map((_, i) => (TOP_PAD + i * NODE_GAP) * dims.vh) : []),
    [dims.vh, data],
  )
  const cx = isMobile ? 28 : dims.vw / 2
  const amp = isMobile ? 11 : Math.min(dims.vw * 0.15, 220)
  const pathD = useMemo(
    () => buildPath(dims.vw, trackPx, cx, amp, nodeYs),
    [dims.vw, trackPx, cx, amp, nodeYs],
  )

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  // Scrubbing impératif : dessin + tête centrée + défilé pellicule + fondu cartes.
  const place = useCallback(
    (p: number) => {
      const total = totalLenRef.current
      const vh = vhRef.current
      const path = pathRef.current
      const track = trackRef.current
      if (!total || !vh || !path || !track) return

      const drawn = clamp01(p)
      path.style.strokeDashoffset = String(total * (1 - drawn))

      // Tête = point au bout du trait dessiné. On défile la pellicule pour la
      // MAINTENIR au centre vertical de l'écran.
      let tipY = 0
      try {
        const pt = path.getPointAtLength(total * drawn)
        tipY = pt.y
        const head = headRef.current
        if (head) {
          head.setAttribute("transform", `translate(${pt.x} ${pt.y})`)
          head.style.opacity = drawn > 0.003 && drawn < 0.997 ? "1" : "0"
        }
      } catch {
        /* getPointAtLength peut throw avant layout — ignoré */
      }
      // On centre la tête, MAIS on borne le défilé pour que la ligne touche le
      // haut de l'écran à l'entrée (raccord avec la section précédente) et le bas
      // à la sortie (raccord avec la clôture) — plus de grand vide aux extrémités.
      const trackPx = trackPxRef.current
      const ty = Math.min(0, Math.max(vh - trackPx, vh / 2 - tipY))
      track.style.transform = `translate3d(0, ${ty}px, 0)`

      // Cartes : visibles quand la tête est proche de leur nœud, sinon fondues.
      const ys = nodeYsRef.current
      const fadeFull = FADE_FULL * vh
      const fadeOut = FADE_OUT * vh
      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i]
        if (!el) continue
        const dist = Math.abs(tipY - (ys[i] ?? 0))
        const op = clamp01((fadeOut - dist) / (fadeOut - fadeFull))
        el.style.opacity = String(op)
        el.style.pointerEvents = op > 0.6 ? "auto" : "none"
        const side = i % 2 === 0 ? 1 : -1 // carte à droite (even) / gauche (odd)
        const dx = isMobile ? 0 : (1 - op) * side * 30
        const s = 0.94 + 0.06 * op
        el.style.transform = `translateY(-50%) translateX(${dx}px) scale(${s})`
      }
    },
    [n, isMobile],
  )

  useMotionValueEvent(scrollYProgress, "change", place)

  // Mesure du viewport (scène sticky) + recalcul sur resize.
  useLayoutEffect(() => {
    const el = sceneRef.current
    if (!el) return
    const measure = () => setDims({ vw: el.clientWidth, vh: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // À chaque nouveau tracé : longueur exacte → dasharray + refs, puis place().
  useLayoutEffect(() => {
    const path = pathRef.current
    if (!path || !pathD || !dims.vh) return
    let len = 0
    try {
      len = path.getTotalLength()
    } catch {
      /* noop */
    }
    totalLenRef.current = len
    vhRef.current = dims.vh
    trackPxRef.current = trackPx
    nodeYsRef.current = nodeYs
    path.style.strokeDasharray = String(len)
    path.style.strokeDashoffset = String(len)
    place(scrollYProgress.get())
  }, [pathD, dims.vh, trackPx, nodeYs, place, scrollYProgress])

  // Modale + deep-link ?s=slug (footer / SavoirFaire pointent ici).
  const params = useSearchParams()
  const [selected, setSelected] = useState<number | null>(() => {
    const s = params.get("s")
    const i = s ? data.findIndex((it) => it.slug === s) : -1
    return i >= 0 ? i : null
  })
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false)

  const syncUrl = useCallback(
    (next: number | null) => {
      const url = new URL(window.location.href)
      if (next == null) url.searchParams.delete("s")
      else url.searchParams.set("s", data[next].slug)
      window.history.replaceState(null, "", url)
    },
    [data],
  )
  const open = useCallback(
    (i: number) => {
      setSelected(i)
      syncUrl(i)
    },
    [syncUrl],
  )
  const close = useCallback(() => {
    setSelected(null)
    syncUrl(null)
  }, [syncUrl])

  useEffect(() => {
    if (selected == null) return
    lenis?.stop()
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      lenis?.start()
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [selected, lenis, close])

  const selectedItem = selected != null ? data[selected] : null
  const modal =
    mounted &&
    createPortal(
      <AnimatePresence>
        {selectedItem && (
          <SolutionZoom
            key={selectedItem.slug}
            item={selectedItem}
            images={images}
            reduce={reduce}
            onClose={close}
          />
        )}
      </AnimatePresence>,
      document.body,
    )

  if (reduce) {
    return (
      <>
        <SimpleList data={data} images={images} onOpen={open} />
        {modal}
      </>
    )
  }

  return (
    <>
      <section
        ref={ref}
        id="solutions"
        data-header-theme="light"
        className="relative bg-background"
        style={{ height: `${SCENE_VH}vh` }}
      >
        {/* Scène épinglée — tout se joue au centre de l'écran. */}
        <div ref={sceneRef} className="sticky top-0 h-screen overflow-hidden">
          {/* Pellicule : ligne + cartes ; défile pour garder la tête au centre. */}
          <div
            ref={trackRef}
            className="absolute inset-x-0 top-0"
            style={{ height: trackPx, willChange: "transform" }}
          >
            <svg
              aria-hidden
              className="absolute inset-0 z-0 w-full"
              style={{ height: trackPx }}
              viewBox={`0 0 ${dims.vw || 1} ${trackPx || 1}`}
              preserveAspectRatio="none"
              fill="none"
            >
              {/* trait fantôme : aperçu du chemin restant */}
              <path
                d={pathD}
                stroke="var(--color-accent)"
                strokeOpacity={0.08}
                strokeWidth={THICK}
                strokeLinecap="round"
              />
              {/* trait dessiné au scroll */}
              <path
                ref={pathRef}
                d={pathD}
                stroke="var(--color-accent)"
                strokeWidth={THICK}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* tête lumineuse, maintenue au centre du viewport */}
              <g ref={headRef} style={{ opacity: 0 }}>
                <circle r={THICK * 2.1} fill="var(--color-accent)" fillOpacity={0.14} />
                <circle r={THICK * 0.78} fill="var(--color-accent)" />
                <circle r={THICK * 0.3} fill="#fff" fillOpacity={0.92} />
              </g>
            </svg>

            {/* Les cartes, alternées de part et d'autre, tailles variées. */}
            {data.map((it, i) => {
              const side: "left" | "right" = i % 2 === 0 ? "right" : "left"
              const size = CARD_SIZES[i % CARD_SIZES.length]
              const style: React.CSSProperties = {
                position: "absolute",
                top: nodeYs[i] ?? 0,
                opacity: 0,
                pointerEvents: "none",
                transform: "translateY(-50%)",
                willChange: "opacity, transform",
              }
              if (isMobile) {
                style.left = 56
                style.right = "5vw"
              } else if (side === "right") {
                style.left = "calc(50% + 2.75rem)"
                style.width = `min(${size.max}px, 44vw)`
              } else {
                style.right = "calc(50% + 2.75rem)"
                style.width = `min(${size.max}px, 44vw)`
              }
              return (
                <div
                  key={it.slug}
                  ref={(el) => {
                    cardRefs.current[i] = el
                  }}
                  className="z-10"
                  style={style}
                >
                  <SolutionCard
                    item={it}
                    images={images}
                    ratio={size.ratio}
                    align={isMobile ? "left" : side}
                    onOpen={() => open(i)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </section>
      {modal}
    </>
  )
}
