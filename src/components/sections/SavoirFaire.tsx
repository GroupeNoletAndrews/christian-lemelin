"use client"

import { useCallback, useState } from "react"
import Image from "next/image"
import { Plus, CaretUp, CaretDown } from "@phosphor-icons/react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import { ArrowLink } from "@/components/ui/ArrowLink"

const services = [
  {
    title: "Mobilier hospitalier personnalisé",
    description:
      "Mobilier sur mesure en acier inoxydable médical, alliant ergonomie, durabilité et hygiène pour hôpitaux, cliniques et laboratoires.",
    img: "/assets/1780581925672-IMG_1281.jpeg",
    href: "/solutions/mobilier-hospitalier",
  },
  {
    title: "Fabrication sur mesure",
    description:
      "Pièces uniques ou en série, réalisées selon vos plans ou développées avec notre équipe technique.",
    img: "/assets/1780581858443-IMG_1292.jpeg",
    href: "/fabrication",
  },
  {
    title: "Découpe laser & Lazer tube",
    description:
      "Précision au dixième de millimètre sur toutes épaisseurs, du prototype à la grande série.",
    img: "/assets/1780581873317-IMG_1291.jpeg",
    href: "/solutions",
  },
  {
    title: "Soudure & assemblage",
    description:
      "Soudeurs certifiés MIG, TIG et structurale pour assemblages industriels et architecturaux exigeants.",
    img: "/assets/1780581884668-IMG_1288.jpeg",
    href: "/solutions",
  },
  {
    title: "Polissage & finitions",
    description:
      "Miroir, satiné, brossé, poudré. Chaque finition exécutée en atelier selon les standards les plus exigeants.",
    img: "/assets/1780581936961-IMG_1277.jpeg",
    href: "/fabrication",
  },

]

// Apple "feature block" image crossfade — reproduced 1:1 from skiper-ui Skiper76.
// Measured behaviour: the new image enters from the right (+x) at scale 0.9 /
// opacity 0, springs to a resting overscan after a ~0.16 s stagger, while the
// outgoing image slides left (-x) and fades immediately. The whole frame glides
// leftward; the stagger + spring overshoot give the fluid Apple feel. The image
// is full-bleed (it fills the whole block), so the resting overscan is a touch
// larger to guarantee the slide never reveals an edge.
const SLIDE = "8%" // horizontal travel, relative to the block width (responsive)

const imageMotion: Variants = {
  initial: { opacity: 0, scale: 0.92, x: SLIDE },
  animate: {
    opacity: 1,
    scale: 1.14, // resting overscan so the slide never reveals an edge
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
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 34,
      opacity: { duration: 0.32 },
    },
  },
}

const imageMotionReduced: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export function SavoirFaire() {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const variants = reduce ? imageMotionReduced : imageMotion

  // Up/down carousel navigation — cycles through the services (wrap-around).
  const go = useCallback(
    (dir: 1 | -1) => setActive((a) => (a + dir + services.length) % services.length),
    [],
  )

  return (
    <section
      data-header-theme="dark"
      className="bg-background px-3 py-3 md:px-4 md:py-4"
    >
      {/* Rounded inset block — the cream page background shows around it. */}
      <div className="relative flex min-h-[calc(100svh-1.5rem)] w-full overflow-hidden rounded-[1.75rem] bg-ink md:min-h-[calc(100svh-2rem)] md:rounded-[2.5rem]">
        {/* ── Full-bleed image — the photo encompasses the whole block ──
            Minimalist placeholder fallback = the bg-ink behind it. */}
        <div className="absolute inset-0">
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={active}
              className="absolute inset-0 will-change-transform"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Image
                src={services[active].img}
                alt={services[active].title}
                fill
                unoptimized
                priority={active === 0}
                sizes="100vw"
                className="object-cover grayscale"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Black-dominant treatment — the block reads black, the monochrome
            photo is a subtle moody backdrop that stays visible on the right. */}
        <div className="pointer-events-none absolute inset-0 bg-black/45" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/15" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

        {/* ── Up / down carousel arrows ── */}
        <div className="absolute right-4 top-[5.5rem] z-20 flex flex-col gap-2.5 sm:right-6 lg:right-8 lg:top-1/2 lg:-translate-y-1/2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Savoir-faire précédent"
            className="grid size-11 place-items-center rounded-full border border-white/20 bg-black/35 text-white/75 backdrop-blur-md transition-colors duration-200 hover:border-white/40 hover:bg-black/55 hover:text-white"
          >
            <CaretUp size={18} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Savoir-faire suivant"
            className="grid size-11 place-items-center rounded-full border border-white/20 bg-black/35 text-white/75 backdrop-blur-md transition-colors duration-200 hover:border-white/40 hover:bg-black/55 hover:text-white"
          >
            <CaretDown size={18} weight="bold" />
          </button>
        </div>

        {/* ── Overlaid content : heading + accordion pills ── */}
        <div className="relative z-10 flex w-full flex-col justify-end px-6 py-16 md:px-10 md:py-20 lg:justify-center lg:px-16 lg:py-24 xl:px-24">
          <div className="w-full max-w-[36rem]">
            <h2 className="max-w-[18ch] font-display text-[clamp(2.25rem,5.5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-white">
              Voici comment nous donnons forme au métal.
            </h2>

            <div className="mt-8 flex flex-col gap-2.5 md:mt-10">
              {services.map((s, i) => {
                const isActive = i === active
                return (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-expanded={isActive}
                    className={`group w-full rounded-[1.6rem] border px-5 py-4 text-left backdrop-blur-md transition-[background-color,border-color] duration-300 ease-out md:px-6 ${
                      isActive
                        ? "border-white/25 bg-black/45 backdrop-blur-xl"
                        : "border-white/12 bg-black/20 hover:border-white/25 hover:bg-black/35"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                          isActive ? "bg-white/20" : "border border-white/25"
                        }`}
                      >
                        {isActive ? (
                          <span className="size-1.5 rounded-full bg-white" />
                        ) : (
                          <Plus
                            size={13}
                            weight="bold"
                            className="text-white/60 transition-colors group-hover:text-white"
                          />
                        )}
                      </span>
                      <span className="font-display text-lg font-medium leading-tight text-white md:text-xl">
                        {s.title}
                      </span>
                    </div>

                    {/* Description — height-animated reveal (grid-rows trick) */}
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="pl-[2.375rem] pt-3">
                          <p className="max-w-[44ch] text-[15px] leading-relaxed text-white/65">
                            {s.description}
                          </p>
                          <ArrowLink href={s.href} dark className="mt-4">
                            En savoir plus
                          </ArrowLink>
                        </div>
                      </div>
                    </div>
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
