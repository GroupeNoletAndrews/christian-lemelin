"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { motion, useReducedMotion, type Variants } from "motion/react"
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
import { ShaderBackdrop } from "@/components/ui/ShaderBackdrop"

gsap.registerPlugin(ScrollTrigger)

const MODAL_TRANSITION = { type: "spring", bounce: 0.05, duration: 0.5 } as const

const descV: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

// The "pourquoi choisir" rows live in the detail page's `list` block — we reuse
// them here so the copy is never duplicated.
function reasonsOf(mat: MaterialDetail) {
  const list = mat.blocks.find(
    (b): b is Extract<ContentBlock, { kind: "list" }> => b.kind === "list",
  )
  return list?.items ?? []
}

// Expanded panel for one material. The card morphs into this (shared layoutId
// on the container, image and title via the linear-modal primitive). Backdrop
// is a monochrome animated shader. Everything stays white/black/grey.
function MaterialModal({ mat }: { mat: MaterialDetail }) {
  const img = imageUrl(mat.cardImage, 1000, 1200)
  const reasons = reasonsOf(mat)
  const reduce = useReducedMotion()

  return (
    <DialogContainer dim={false}>
      {/* Animated monochrome backdrop: blooms from the centre of the screen and
          settles ~90% opaque (the page stays faintly visible). The built-in dim
          is disabled (dim={false}) so this is the only backdrop layer. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        initial={reduce ? false : { clipPath: "circle(0% at 50% 50%)" }}
        animate={reduce ? undefined : { clipPath: "circle(150% at 50% 50%)" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <ShaderBackdrop className="h-full w-full opacity-90" />
      </motion.div>
      <DialogContent className="flex max-h-[88vh] w-full max-w-[660px] flex-col rounded-3xl border border-border bg-surface shadow-2xl">
        {/* Header image — morphs from the card */}
        <div className="relative h-36 shrink-0 overflow-hidden sm:h-44">
          <DialogImage
            src={img}
            alt={mat.name}
            className="h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10"
          />
          <DialogClose className="absolute right-3 top-3 z-10 size-9 bg-white/15 text-white backdrop-blur-md hover:bg-white/30" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <DialogTitle>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs tracking-[0.2em] text-white/70">
                  {mat.code}
                </span>
                <h3 className="font-display text-3xl font-semibold leading-none text-white sm:text-4xl">
                  {mat.shortName}
                </h3>
              </div>
            </DialogTitle>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
            {mat.fullName}
          </p>
          <DialogDescription variants={descV} className="mt-3">
            <p className="leading-relaxed text-foreground">{mat.hero.intro}</p>

            {reasons.length > 0 && (
              <div className="mt-7">
                {reasons.map((it, i) => (
                  <div
                    key={i}
                    className="border-t border-border py-4 sm:grid sm:grid-cols-[1fr_1.5fr] sm:gap-6"
                  >
                    <h4 className="font-display text-base font-medium text-foreground sm:text-lg">
                      {it.title}
                    </h4>
                    {it.body && (
                      <p className="mt-1.5 leading-relaxed text-foreground-muted sm:mt-0">
                        {it.body}
                      </p>
                    )}
                  </div>
                ))}
                <div className="border-t border-border" />
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {mat.properties.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-border px-3 py-1 text-[13px] text-foreground-muted"
                >
                  {p}
                </span>
              ))}
            </div>
          </DialogDescription>
        </div>
      </DialogContent>
    </DialogContainer>
  )
}

// The grayscale image + code/name overlay + "+" affordance, shared by the
// mobile and desktop card shells (only the aspect ratio differs).
function CardInner({ mat, titleClass }: { mat: MaterialDetail; titleClass: string }) {
  return (
    <>
      <DialogImage
        src={imageUrl(mat.cardImage, 900, 1100)}
        alt={mat.name}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
      />
      <span className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors duration-300 group-hover:bg-white/35">
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

export function Materiaux() {
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
                    titleClass="font-display text-2xl font-semibold leading-none text-white"
                  />
                </DialogTrigger>
                <p className="mt-3 text-sm text-foreground-muted">{mat.fullName}</p>
                <MaterialModal mat={mat} />
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
                    titleClass="font-display text-[clamp(1.75rem,2.4vw,2.5rem)] font-semibold leading-none text-white"
                  />
                </DialogTrigger>
                <p className="mt-4 text-sm text-foreground-muted">{mat.fullName}</p>
                <MaterialModal mat={mat} />
              </Dialog>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
