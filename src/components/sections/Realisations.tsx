"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { useAdmin } from "@/lib/admin-context"
import { Realisation } from "@/types/admin"
import { Eyebrow } from "@/components/ui/Eyebrow"
import { ArrowLink } from "@/components/ui/ArrowLink"
import { Tag } from "@/components/ui/Tag"

// Alternating aspect ratios for a masonry rhythm.
const RATIOS = ["aspect-[4/3]", "aspect-[4/5]", "aspect-[4/5]", "aspect-[4/3]"]

function RealisationCard({
  realisation,
  ratio,
  index,
}: {
  realisation: Realisation
  ratio: string
  index: number
}) {
  const images = realisation.images.length ? realisation.images : [""]
  const [active, setActive] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = () => {
    if (timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
  }

  const start = () => {
    if (images.length <= 1) return
    stop()
    timer.current = setInterval(() => {
      setActive((i) => (i + 1) % images.length)
    }, 900)
  }

  const reset = () => {
    stop()
    setActive(0)
  }

  // Clean up on unmount
  useEffect(() => stop, [])

  return (
    <motion.article
      className="group mb-6 break-inside-avoid"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.06 }}
      onMouseEnter={start}
      onMouseLeave={reset}
    >
      <div
        className={`relative ${ratio} overflow-hidden rounded-2xl border border-border bg-surface-elevated`}
      >
        {images.map((src, i) =>
          src ? (
            <Image
              key={i}
              src={src}
              alt={realisation.name}
              fill
              unoptimized
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className={`object-cover transition-opacity duration-500 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : null
        )}

        {/* Carousel indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="font-display text-xl font-medium leading-tight text-foreground">
          {realisation.name}
        </h3>
        {realisation.category && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Tag>{realisation.category}</Tag>
          </div>
        )}
      </div>
    </motion.article>
  )
}

export function Realisations() {
  const { realisations, maxPinned } = useAdmin()
  const pinned = realisations.filter((r) => r.pinned).slice(0, maxPinned)

  return (
    <section data-header-theme="light" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Réalisations</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-foreground">
              Quelques projets récents.
            </h2>
          </div>
          <ArrowLink href="/realisations">Voir tout</ArrowLink>
        </div>

        {/* Masonry */}
        {pinned.length > 0 ? (
          <div className="mt-14 gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
            {pinned.map((r, i) => (
              <RealisationCard
                key={r.id}
                realisation={r}
                ratio={RATIOS[i % RATIOS.length]}
                index={i}
              />
            ))}
          </div>
        ) : (
          <p className="mt-14 font-sans text-foreground-muted">
            Aucune réalisation épinglée pour le moment.
          </p>
        )}
      </div>
    </section>
  )
}
