"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "motion/react"
import { ArrowUpRight } from "@phosphor-icons/react"
import { SOLUTIONS_OVERVIEW, imageUrl } from "@/content"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { DrawLine } from "@/components/ui/DrawLine"

// Index typographique au survol (pattern « sites primés » / pointlaz) : les
// noms géants des 6 catégories ; au survol, un aperçu monochrome suit le
// curseur et les autres noms s'estompent. Aucune carte, aucun numéro.
// Sur tactile : vignette inline par ligne (pas d'aperçu flottant).
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

export function SolutionsIndex() {
  const items = SOLUTIONS_OVERVIEW.index
  const reduce = useReducedMotion() ?? false
  const canHover = useMediaQuery("(hover: hover)")
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const interactive = canHover && isDesktop && !reduce

  const wrapRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)

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

  const activeItem = active != null ? items[active] : null

  return (
    <section data-header-theme="light" className="bg-background">
      <div
        ref={wrapRef}
        onMouseMove={onMove}
        onMouseLeave={() => setActive(null)}
        className="relative mx-auto max-w-[1400px] px-6 py-16 md:px-12 md:py-24"
      >
        {/* Aperçu flottant suiveur de curseur — desktop + survol uniquement */}
        {interactive && (
          <motion.div
            aria-hidden
            style={{ x, y }}
            className="pointer-events-none absolute left-0 top-0 z-20 w-[clamp(14rem,18vw,18rem)]"
          >
            <AnimatePresence mode="popLayout">
              {activeItem && (
                <motion.div
                  key={activeItem.slug}
                  variants={previewV}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border shadow-2xl shadow-black/20"
                >
                  <Image
                    src={imageUrl(activeItem.hoverImage, 800, 1000)}
                    alt={activeItem.title}
                    fill
                    sizes="18vw"
                    className="object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="relative z-10">
          {items.map((it, i) => {
            const dim = interactive && active != null && active !== i
            const on = active === i
            return (
              <div key={it.slug}>
                <DrawLine delay={i * 0.06} />
                <Link
                  href={`/solutions/${it.slug}`}
                  onMouseEnter={() => interactive && setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="group flex items-center gap-5 py-5 md:gap-8 md:py-8"
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
                    <motion.span
                      animate={interactive ? { x: on ? 14 : 0 } : undefined}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className={`block font-display text-[clamp(1.75rem,7vw,4.75rem)] font-medium leading-[0.98] tracking-[-0.02em] transition-colors duration-300 ${
                        dim ? "text-foreground/30" : "text-foreground"
                      }`}
                    >
                      {it.title}
                    </motion.span>
                    <span
                      className={`mt-2 block max-w-[52ch] text-sm leading-relaxed text-foreground-muted transition-opacity duration-300 md:text-base ${
                        dim ? "opacity-40" : "opacity-100"
                      }`}
                    >
                      {it.tagline}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={28}
                    weight="bold"
                    className={`shrink-0 text-accent transition-all duration-300 ${
                      interactive
                        ? on
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-2 opacity-0"
                        : "opacity-100"
                    }`}
                  />
                </Link>
              </div>
            )
          })}
          <DrawLine delay={items.length * 0.06} />
        </div>
      </div>
    </section>
  )
}
