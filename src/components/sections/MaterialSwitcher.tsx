"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react"
import { CaretUp, CaretDown } from "@phosphor-icons/react"
import { FABRICATION, MATERIALS, imageUrl, type MaterialDetail } from "@/content"
import { ArrowLink } from "@/components/ui/ArrowLink"

// Showcase matériaux de /fabrication. Réutilise le crossfade « Apple » de
// SavoirFaire (image full-bleed monochrome) mais en version STATIONNAIRE plein
// cadre à sélection discrète (liste + flèches + autoplay) — distinct du home
// Materiaux.tsx (scroll horizontal GSAP). Ordre Inox → Acier → Alu → Laiton →
// Cuivre. Voir DESIGN.md §7.
const SLIDE = "8%"

const imageMotion: Variants = {
  initial: { opacity: 0, scale: 0.92, x: SLIDE },
  animate: {
    opacity: 1,
    scale: 1.14,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 20,
      mass: 0.9,
      delay: 0.16,
      opacity: { duration: 0.45, delay: 0.16 },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    x: `-${SLIDE}`,
    transition: { type: "spring", stiffness: 260, damping: 34, opacity: { duration: 0.32 } },
  },
}

const imageMotionReduced: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const textV: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
}

export function MaterialSwitcher() {
  const reduce = useReducedMotion()
  const variants = reduce ? imageMotionReduced : imageMotion

  const mats = FABRICATION.showcase.materialSlugs
    .map((slug) => MATERIALS.find((m) => m.slug === slug))
    .filter((m): m is MaterialDetail => Boolean(m))

  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const blockRef = useRef<HTMLDivElement>(null)
  const inView = useInView(blockRef, { amount: 0.5 })

  const go = useCallback(
    (dir: 1 | -1) => setActive((a) => (a + dir + mats.length) % mats.length),
    [mats.length],
  )

  useEffect(() => {
    if (reduce || paused || !inView) return
    const t = setInterval(() => setActive((a) => (a + 1) % mats.length), 6000)
    return () => clearInterval(t)
  }, [reduce, paused, inView, mats.length])

  const m = mats[active]

  return (
    <section data-header-theme="dark" className="bg-background px-3 py-3 md:px-4 md:py-4">
      <div
        ref={blockRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative flex min-h-[calc(100svh-1.5rem)] w-full overflow-hidden rounded-[1.75rem] bg-ink md:min-h-[calc(100svh-2rem)] md:rounded-[2.5rem]"
      >
        {/* Full-bleed monochrome image — Apple crossfade */}
        <div className="absolute inset-0">
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={m.slug}
              className="absolute inset-0 will-change-transform"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Image
                src={imageUrl(m.hero.image, 2000, 1400)}
                alt={m.name}
                fill
                priority={active === 0}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scrims — bloc lit noir, la photo reste un fond texturé */}
        <div className="pointer-events-none absolute inset-0 bg-black/45" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/15" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

        {/* Flèches haut/bas */}
        <div className="absolute right-4 top-[5.5rem] z-20 flex flex-col gap-2.5 sm:right-6 lg:right-8 lg:top-1/2 lg:-translate-y-1/2">
          <button
            type="button"
            onClick={() => {
              go(-1)
              setPaused(true)
            }}
            aria-label="Matériau précédent"
            className="grid size-11 place-items-center rounded-full border border-white/20 bg-black/35 text-white/75 backdrop-blur-md transition-colors duration-200 hover:border-white/40 hover:bg-black/55 hover:text-white"
          >
            <CaretUp size={18} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => {
              go(1)
              setPaused(true)
            }}
            aria-label="Matériau suivant"
            className="grid size-11 place-items-center rounded-full border border-white/20 bg-black/35 text-white/75 backdrop-blur-md transition-colors duration-200 hover:border-white/40 hover:bg-black/55 hover:text-white"
          >
            <CaretDown size={18} weight="bold" />
          </button>
        </div>

        {/* Contenu */}
        <div className="relative z-10 flex w-full flex-col justify-end px-6 py-16 md:px-10 md:py-20 lg:justify-center lg:px-16 lg:py-24 xl:px-24">
          <div className="w-full max-w-[40rem]">
            <h2 className="max-w-[18ch] font-display text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.01em] text-white">
              {FABRICATION.showcase.heading}
            </h2>
            <p className="mt-4 max-w-[44ch] leading-relaxed text-white/65">
              {FABRICATION.showcase.intro}
            </p>

            {/* Matériau actif (crossfade texte) */}
            <div
              className="mt-8 min-h-[clamp(12rem,24vh,15rem)]"
              aria-live="polite"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={m.slug}
                  variants={reduce ? undefined : textV}
                  initial={reduce ? { opacity: 0 } : "initial"}
                  animate={reduce ? { opacity: 1 } : "animate"}
                  exit={reduce ? { opacity: 0 } : "exit"}
                  transition={reduce ? { duration: 0.2 } : undefined}
                >
                  <h3 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.01em] text-white">
                    {m.name}
                  </h3>
                  <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-white/45">
                    {m.fullName} · {m.code}
                  </p>
                  <p className="mt-4 max-w-[46ch] leading-relaxed text-white/70">{m.blurb}</p>
                  <ArrowLink href={`/materiaux/${m.slug}`} dark className="mt-5">
                    Explorer ce matériau
                  </ArrowLink>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Liste de noms — sans numéro */}
            <div className="mt-8 flex flex-col border-t border-white/12">
              {mats.map((mat, i) => {
                const on = i === active
                return (
                  <button
                    key={mat.slug}
                    type="button"
                    onClick={() => {
                      setActive(i)
                      setPaused(true)
                    }}
                    aria-pressed={on}
                    className="group flex items-center gap-4 border-b border-white/12 py-3 text-left"
                  >
                    <span
                      className={`h-4 w-px origin-center transition-transform duration-300 ${
                        on ? "scale-y-100 bg-white" : "scale-y-0 bg-white/40"
                      }`}
                    />
                    <span
                      className={`font-display text-base font-medium transition-colors duration-300 ${
                        on ? "text-white" : "text-white/45 group-hover:text-white"
                      }`}
                    >
                      {mat.name}
                    </span>
                    <span
                      className={`ml-auto font-mono text-[11px] tracking-[0.15em] transition-colors duration-300 ${
                        on ? "text-white/60" : "text-white/25"
                      }`}
                    >
                      {mat.code}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
