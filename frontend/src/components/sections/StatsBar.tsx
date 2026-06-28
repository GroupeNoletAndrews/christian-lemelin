"use client"

import { useEffect, useRef } from "react"
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"
import { Marquee } from "@/components/ui/marquee"
import { SITE_MEDIA, mediaUrl } from "@/lib/media"

const stats = [
  { value: "20+", label: "Années d'expertise" },
  { value: "2 400+", label: "Projets réalisés" },
  { value: "5", label: "Matériaux maîtrisés" },
  { value: "100%", label: "Fabriqué au Québec" },
]

// Client / partner logos — served from Supabase Storage (christian-alain bucket,
// photos/logo/clients/). Source of truth = SITE_MEDIA.clients (src/lib/media.ts);
// files live in public/logos/ and are uploaded by `npm run media:sync`.
const clients = SITE_MEDIA.clients

// Same easing as the menu's drawing lines (Header.tsx) — "comme le menu bar".
const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

// French thousands grouping with a narrow no-break space → "2 400".
function groupFr(v: number) {
  return Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

// Split "2 400+" → { prefix:"", target:2400, suffix:"+" } (keeps %, +, etc.).
function parseStat(value: string) {
  const m = value.match(/^(\D*?)([\d\s.,  ]*\d)(\D*)$/)
  if (!m) return { prefix: "", target: 0, suffix: value }
  return { prefix: m[1], target: parseInt(m[2].replace(/\D/g, ""), 10) || 0, suffix: m[3] }
}

// A single stat number that counts up from 0 when it scrolls into view.
function StatNumber({ value }: { value: string }) {
  const { prefix, target, suffix } = parseStat(value)
  const reduce = useReducedMotion()
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const count = useMotionValue(reduce ? target : 0)
  const text = useTransform(count, (v) => `${prefix}${groupFr(v)}${suffix}`)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(count, target, { duration: 1.8, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [inView, reduce, target, count])

  return (
    <motion.p
      ref={ref}
      className="font-display text-[clamp(2.25rem,4.6vw,3.5rem)] font-semibold leading-none tracking-[-0.03em] text-foreground tabular-nums"
    >
      {text}
    </motion.p>
  )
}

// Hairline that draws itself left→right when it enters — like the menu frame.
function DrawLine() {
  return (
    <motion.div
      className="h-px w-full origin-left bg-border"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.9 }}
      transition={{ duration: 1, ease: EASE }}
    />
  )
}

// A single client logo tile. Logos are greyscale + dimmed at rest and animate
// to full colour (with a subtle lift) on hover — the OTHER cards stay visible
// (no inversion). Neutral, no blue.
function ClientCard({ name, src }: { name: string; src: string }) {
  return (
    <figure className="group flex h-24 w-52 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface px-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-sm sm:h-28 sm:w-60 md:w-64">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        loading="lazy"
        className="max-h-9 w-full max-w-[150px] object-contain opacity-60 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 sm:max-h-11"
      />
    </figure>
  )
}

// Two rows of client cards scrolling in opposite directions, edges faded into
// the cream background. Pauses on hover; the Marquee primitive disables the
// animation under prefers-reduced-motion.
function ClientsMarquee() {
  const half = Math.ceil(clients.length / 2)
  const firstRow = clients.slice(0, half)
  const secondRow = clients.slice(half)

  return (
    // Full-bleed: span the whole viewport width regardless of the section's
    // max-width container.
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden">
      <div className="flex flex-col gap-3 md:gap-5">
        <Marquee pauseOnHover className="[--duration:42s] [--gap:0.75rem] py-0 sm:[--gap:1rem] md:[--gap:1.5rem]">
          {firstRow.map((c) => (
            <ClientCard key={c.name} name={c.name} src={mediaUrl(c.key)} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:42s] [--gap:0.75rem] py-0 sm:[--gap:1rem] md:[--gap:1.5rem]">
          {secondRow.map((c) => (
            <ClientCard key={c.name} name={c.name} src={mediaUrl(c.key)} />
          ))}
        </Marquee>
      </div>
      {/* Edge fades into the section's cream background. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-background to-transparent sm:w-32 md:w-48" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-background to-transparent sm:w-32 md:w-48" />
    </div>
  )
}

export function StatsBar() {
  return (
    <section
      data-header-theme="light"
      className="bg-background py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Drawing line — delimits the section, like the menu bar */}
        <DrawLine />

        {/* Stats — centered, counting up on scroll */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-10 text-center md:py-14 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <StatNumber value={stat.value} />
              <p className="mt-4 max-w-[16ch] text-sm leading-relaxed text-foreground-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Drawing line + clients/partners marquee */}
        <DrawLine />
        <div className="pt-12 md:pt-16">
          <p className="mb-10 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-foreground-muted/80">
            Ils nous font confiance
          </p>
          <ClientsMarquee />
        </div>
      </div>
    </section>
  )
}
