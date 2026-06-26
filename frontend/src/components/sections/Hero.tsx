"use client"

import { useEffect, useState } from "react"
import { motion, type Variants } from "motion/react"
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr"
import { mediaUrl, SITE_MEDIA } from "@/lib/media"

// Full-bleed looping video hero (pointlaz-inspired) in our OPUS style.
// The video autoplays/loops with no controls; the text reveals after 3 s.
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
}

export function Hero() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      data-header-theme="dark"
      className="relative h-[100svh] w-full overflow-hidden bg-ink"
    >
      {/* Looping background video — no controls, no interaction */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={mediaUrl(SITE_MEDIA.heroVideo)} type="video/mp4" />
      </video>

      {/* Legibility gradient (dark at bottom for text, mild at top for the nav) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/40" />

      {/* Content — anchored bottom-left, revealed after 3 s */}
      <div className="relative z-10 flex h-full flex-col justify-end">
        <motion.div
          variants={container}
          initial="hidden"
          animate={show ? "show" : "hidden"}
          className="w-full px-6 pb-16 md:px-12 md:pb-24"
        >
          <motion.h1
            variants={item}
            className="font-display text-[clamp(3rem,11vw,10rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white"
          >
            <span className="block -ml-3 md:-ml-9 md:whitespace-nowrap">
              Les Entreprises
            </span>
            <span className="mt-1 block ml-1 md:mt-2 md:ml-16 md:whitespace-nowrap">
              Christian Lemelin
            </span>
          </motion.h1>

          <motion.div
            variants={item}
            className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end md:gap-12"
          >
            <p className="ml-1 max-w-[52ch] text-lg leading-relaxed text-white/80 md:ml-16 md:text-xl">
              Atelier de fabrication métallique sur mesure à Québec. Inox, acier,
              aluminium, laiton et cuivre — travaillés avec la même exigence depuis
              des décennies.
            </p>
            <a
              href="/solutions"
              className="w-fit shrink-0 text-lg font-medium text-white underline decoration-2 underline-offset-[6px] decoration-white/80 transition-colors hover:decoration-white md:text-xl"
            >
              Voir nos solutions
              <ArrowUpRight
                size={26}
                weight="bold"
                className="ml-2 inline align-middle text-accent"
              />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
