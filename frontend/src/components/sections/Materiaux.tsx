"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  type Variants,
} from "motion/react"
import { Plus } from "@phosphor-icons/react"
import {
  MATERIALS as materials,
  imageUrl,
  type MaterialDetail,
  type ContentBlock,
} from "@/content"
import {
  Dialog,
  DialogTrigger,
  DialogContainer,
  DialogContent,
  DialogImage,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/linear-modal"
import { cardSlot } from "@/lib/sections-registry"
import { PLACEHOLDER_SRC } from "@/lib/media"
import { useSlotOverride } from "@/lib/section-preview"
import { ImagePlaceholder } from "@/components/sections/ImagePlaceholder"

gsap.registerPlugin(ScrollTrigger)

const MODAL_TRANSITION = { type: "spring", bounce: 0.05, duration: 0.5 } as const

const descV: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

// Résout l'image d'une matière en respectant, dans l'ordre : l'override mis en
// scène dans l'aperçu admin (postMessage), l'override publié en base (prop
// `images` via resolveSectionImages → Supabase Storage), puis le défaut seed baké.
// Retourne "" quand aucune photo n'est encore posée (sentinelle prod
// PLACEHOLDER_SRC) → l'appelant affiche <ImagePlaceholder /> au lieu de l'image.
function useCardSrc(
  mat: MaterialDetail,
  images: Record<string, string>,
  w: number,
  h: number,
): string {
  const staged = useSlotOverride("materiaux", cardSlot(mat.slug))
  const resolved = staged ?? images[cardSlot(mat.slug)]
  if (resolved === PLACEHOLDER_SRC) return ""
  if (resolved) return resolved
  return imageUrl(mat.cardImage, w, h)
}

// The "pourquoi choisir" rows live in the detail page's `list` block — we reuse
// them here so the copy is never duplicated.
function reasonsOf(mat: MaterialDetail) {
  const list = mat.blocks.find(
    (b): b is Extract<ContentBlock, { kind: "list" }> => b.kind === "list",
  )
  return list?.items ?? []
}

// Expanded panel for one material — a "3D draft": a two-panel editorial layout
// that tilts in perspective toward the cursor (the whole card is a physical
// object), with a moving light "sheen" sweeping the metal image and the title
// parallaxing forward. The reasons read as numbered chapters of a story so the
// modal feels like a narrative, not a spec sheet. All motion is transform/
// opacity only (GPU), and the whole 3D layer is disabled under reduced-motion.
function MaterialModal({
  mat,
  images,
}: {
  mat: MaterialDetail
  images: Record<string, string>
}) {
  const img = useCardSrc(mat, images, 1100, 1400)
  const reasons = reasonsOf(mat)
  const reduce = useReducedMotion()

  // Pointer-driven tilt. rx/ry are the raw target angles; the springs smooth
  // them so the card eases rather than snaps. gx/gy drive the sheen position.
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const spring = { stiffness: 140, damping: 18, mass: 0.4 }
  const rxs = useSpring(rx, spring)
  const rys = useSpring(ry, spring)
  // Title floats opposite the tilt → parallax depth without preserve-3d (which
  // an overflow-hidden panel would flatten anyway).
  const titleX = useTransform(rys, (v) => v * -1.6)
  const titleY = useTransform(rxs, (v) => v * 1.6)
  const sheen = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.42), rgba(255,255,255,0) 55%)`

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width
    const ny = (e.clientY - r.top) / r.height
    ry.set((nx - 0.5) * 12) // left/right → rotateY
    rx.set((0.5 - ny) * 12) // up/down → rotateX
    gx.set(nx * 100)
    gy.set(ny * 100)
  }
  function handleLeave() {
    rx.set(0)
    ry.set(0)
    gx.set(50)
    gy.set(50)
  }

  return (
    <DialogContainer>
      {/* Perspective stage — sized to the card so the tilt pivots on its centre. */}
      <div
        className="relative w-full max-w-[940px] [perspective:1500px]"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <DialogContent
          style={reduce ? undefined : { rotateX: rxs, rotateY: rys }}
          className="flex max-h-[86vh] w-full flex-col rounded-3xl border border-border bg-surface shadow-[0_40px_120px_-30px_rgba(0,0,0,0.55)] md:flex-row"
        >
          <DialogClose className="absolute right-4 top-4 z-20 size-9 bg-surface/80 text-foreground ring-1 ring-border backdrop-blur hover:bg-surface" />

          {/* Left panel — the material itself, full-bleed, with a live sheen. */}
          <div className="relative h-52 w-full shrink-0 overflow-hidden md:h-auto md:w-[44%]">
            {img ? (
              <DialogImage
                src={img}
                alt={mat.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <ImagePlaceholder />
            )}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30 md:bg-gradient-to-t md:from-black/85 md:via-black/35 md:to-black/15"
            />
            {/* Metallic sheen — follows the cursor; off under reduced-motion. */}
            {!reduce && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                style={{ background: sheen }}
              />
            )}
            <motion.div
              className="absolute inset-x-0 bottom-0 p-6 sm:p-7"
              style={reduce ? undefined : { x: titleX, y: titleY }}
            >
              <DialogTitle>
                <span className="font-mono text-xs tracking-[0.22em] text-white/70">
                  {mat.code}
                </span>
                <h3 className="mt-2 font-display text-4xl font-semibold leading-[0.95] text-white sm:text-5xl">
                  {mat.shortName}
                </h3>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
                  {mat.fullName}
                </p>
              </DialogTitle>
            </motion.div>
          </div>

          {/* Right panel — the story. Scrolls independently. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-7 sm:px-8 sm:py-9">
            <DialogDescription variants={descV}>
              <p className="text-pretty text-[1.0625rem] leading-relaxed text-foreground">
                {mat.hero.intro}
              </p>

              {reasons.length > 0 && (
                <div className="mt-8">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                    Pourquoi le choisir
                  </p>
                  <div className="mt-4 border-t border-border">
                    {reasons.map((it, i) => (
                      <div key={i} className="border-b border-border py-5">
                        <h4 className="font-display text-lg font-medium leading-snug text-foreground">
                          {it.title}
                        </h4>
                        {it.body && (
                          <p className="mt-1.5 leading-relaxed text-foreground-muted">
                            {it.body}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DialogDescription>
          </div>
        </DialogContent>
      </div>
    </DialogContainer>
  )
}

// The grayscale image + code/name overlay + "+" affordance, shared by the
// mobile and desktop card shells (only the aspect ratio differs).
function CardInner({
  mat,
  images,
  titleClass,
}: {
  mat: MaterialDetail
  images: Record<string, string>
  titleClass: string
}) {
  const src = useCardSrc(mat, images, 900, 1100)
  return (
    <>
      {src ? (
        <DialogImage
          src={src}
          alt={mat.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <ImagePlaceholder />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
      />
      {/* Dark glass chip so the white "+" keeps contrast on pale images too —
          a translucent-white chip vanished over light photos. */}
      <span className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-black/35 text-white shadow-sm ring-1 ring-white/25 backdrop-blur-md transition-colors duration-300 group-hover:bg-black/55">
        <Plus size={18} weight="bold" />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-5">
        <DialogTitle>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs tracking-[0.2em] text-white/70">{mat.code}</span>
            <h3 className={titleClass}>{mat.shortName}</h3>
          </div>
        </DialogTitle>
      </div>
    </>
  )
}

export function Materiaux({
  images = {},
}: {
  /** Overrides d'images publiés/mis en scène, par slot (resolveSectionImages). */
  images?: Record<string, string>
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || !wrapRef.current || !trackRef.current) return
    const ctx = gsap.context(() => {
      // Functions (not a captured number) so `invalidateOnRefresh` recomputes
      // both the scroll length AND the track translation on every refresh.
      const distance = () => trackRef.current!.scrollWidth - window.innerWidth
      gsap.to(trackRef.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    }, wrapRef)

    // The pin is measured at mount — but the Preloader locks scroll
    // (`body{overflow:hidden}` + `lenis.stop()`), and `display:swap` fonts and
    // lazy images all reflow the page afterward. Without a refresh the
    // pin-spacer keeps its stale height and the next section overlaps this one
    // (intermittent, prod-only). Recompute once the layout settles.
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready?.then(refresh)
    window.addEventListener("load", refresh)
    window.addEventListener("eclemelin:preloader-done", refresh)
    const t = window.setTimeout(refresh, 3200) // fallback ≈ Preloader dismissal

    return () => {
      window.clearTimeout(t)
      window.removeEventListener("load", refresh)
      window.removeEventListener("eclemelin:preloader-done", refresh)
      ctx.revert()
    }
  }, [reduce])

  return (
    <section data-header-theme="light" className="bg-background">
      {/* Mobile: horizontal swipe carousel (scroll-snap) — cards peek so it
          reads as swipeable; touch-pan-x lets vertical page scroll pass through. */}
      <div className="md:hidden">
        <div className="px-6 pb-8 pt-24">
          <h2 className="font-display text-[clamp(2rem,9vw,2.75rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-foreground">
            Une maîtrise complète de la gamme.
          </h2>
          <p className="mt-4 max-w-[40ch] text-sm leading-relaxed text-foreground-muted">
            Glissez pour parcourir les matières — touchez-en une pour ses propriétés et nos savoir-faire.
          </p>
        </div>
        <div className="flex snap-x snap-mandatory touch-pan-x gap-4 overflow-x-auto scroll-pl-6 px-6 pb-16 [-ms-overflow-style:none] [scrollbar-width:none]">
          {materials.map((mat) => (
            <div key={mat.code} className="w-[78vw] max-w-[320px] shrink-0 snap-start">
              <Dialog transition={MODAL_TRANSITION} morph={false}>
                <DialogTrigger className="group relative block aspect-[5/4] w-full overflow-hidden rounded-2xl border border-border">
                  <CardInner
                    mat={mat}
                    images={images}
                    titleClass="font-display text-2xl font-semibold leading-none text-white"
                  />
                </DialogTrigger>
                <p className="mt-3 text-sm text-foreground-muted">{mat.fullName}</p>
                <MaterialModal mat={mat} images={images} />
              </Dialog>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: horizontal scroll carousel */}
      <div ref={wrapRef} className="relative hidden overflow-hidden md:block">
        <div ref={trackRef} className="flex h-[100dvh] items-center">
          {/* Intro panel */}
          <div className="flex h-full w-[40vw] shrink-0 flex-col justify-center px-14 xl:px-20">
            <h2 className="font-display text-[clamp(2.25rem,3.8vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-foreground">
              Une maîtrise complète de la gamme.
            </h2>
            <p className="mt-6 max-w-[36ch] leading-relaxed text-foreground-muted">
              Inox, acier, aluminium, laiton et cuivre, travaillés avec la même
              exigence depuis des décennies. Cliquez une matière pour en savoir plus.
            </p>
            <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6">
              {materials.map((mat) => (
                <div
                  key={mat.code}
                  className="flex items-center gap-4 font-mono text-xs tracking-[0.12em]"
                >
                  <span className="flex-1 text-foreground">{mat.shortName}</span>
                  <span className="text-foreground-muted">{mat.code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Material cards */}
          {materials.map((mat) => (
            <div
              key={mat.code}
              className="flex h-full w-[28vw] shrink-0 flex-col justify-center px-6"
            >
              <Dialog transition={MODAL_TRANSITION} morph={false}>
                <DialogTrigger className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border">
                  <CardInner
                    mat={mat}
                    images={images}
                    titleClass="font-display text-[clamp(1.75rem,2.4vw,2.5rem)] font-semibold leading-none text-white"
                  />
                </DialogTrigger>
                <p className="mt-4 text-sm text-foreground-muted">{mat.fullName}</p>
                <MaterialModal mat={mat} images={images} />
              </Dialog>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
