"use client"

import { useEffect, useRef, useState } from "react"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import type { Realisation } from "@/types/admin"
import { RealisationCard } from "@/components/realisations/RealisationCard"
import type { RealisationsLayout } from "@/lib/layouts"

// Renders a set of réalisations in the admin-chosen layout. Shared by the home
// section and the /realisations collection. Every variant is responsive.
type GridProps = {
  items: Realisation[]
  /** Where a tile links (e.g. /realisations?featured=id on home). */
  cardHref?: (r: Realisation) => string | undefined
  /** Clicking a tile opens it (the lightbox). Ignored when cardHref is set. */
  onSelect?: (r: Realisation) => void
  /** Content-workspace preview: pencil to edit a réalisation in place. */
  onEdit?: (id: string) => void
  /** This grid is the page's lead content (only /realisations) — the first
   *  tile then preloads as the LCP. On the home page the same grid sits far
   *  below the fold, where preloading would only compete with the hero video. */
  aboveFold?: boolean
}

export function RealisationsGrid({
  layout,
  ...props
}: GridProps & { layout: RealisationsLayout }) {
  if (props.items.length === 0) return null
  switch (layout) {
    case "uniform":
      return <UniformGrid {...props} />
    case "carousel":
      return <CarouselGrid {...props} />
    case "masonry":
    default:
      return <MasonryGrid {...props} />
  }
}

function edit(onEdit: GridProps["onEdit"], id: string) {
  return onEdit ? () => onEdit(id) : undefined
}

function select(onSelect: GridProps["onSelect"], r: Realisation) {
  return onSelect ? () => onSelect(r) : undefined
}

function MasonryGrid({ items, cardHref, onSelect, onEdit, aboveFold }: GridProps) {
  return (
    <div className="gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
      {items.map((r, i) => (
        <RealisationCard
          key={r.id}
          realisation={r}
          index={i}
          priority={!!aboveFold && i === 0}
          href={cardHref?.(r)}
          onSelect={select(onSelect, r)}
          onEdit={edit(onEdit, r.id)}
        />
      ))}
    </div>
  )
}

function UniformGrid({ items, cardHref, onSelect, onEdit, aboveFold }: GridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((r, i) => (
        <RealisationCard
          key={r.id}
          realisation={r}
          index={i}
          ratio="aspect-[4/3]"
          priority={!!aboveFold && i === 0}
          href={cardHref?.(r)}
          onSelect={select(onSelect, r)}
          onEdit={edit(onEdit, r.id)}
          noMargin
        />
      ))}
    </div>
  )
}

function CarouselGrid({ items, cardHref, onSelect, onEdit, aboveFold }: GridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  const scrollByCard = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    const card = el.querySelector<HTMLElement>("[data-card]")
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: "smooth" })
  }

  // Only auto-advance while the strip is actually ON SCREEN. It used to run
  // regardless, so it kept stepping through cards while you were elsewhere on
  // the page and you arrived mid-animation — the carousel appeared to lurch the
  // moment it came into view.
  const [onScreen, setOnScreen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), {
      threshold: 0.35,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Hold the auto-advance off while the visitor is driving the strip. Hover
  // alone was not enough: a wheel or swipe could land between the mouseenter
  // and the effect that clears the timer, and the interval's smooth scrollBy
  // then fought the gesture — the strip appeared to snap as you started or
  // finished scrolling it. Any user-driven scroll now buys 2.5s of quiet.
  const holdUntil = useRef(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const hold = () => {
      holdUntil.current = performance.now() + 2500
    }
    el.addEventListener("wheel", hold, { passive: true })
    el.addEventListener("touchmove", hold, { passive: true })
    el.addEventListener("pointerdown", hold)
    return () => {
      el.removeEventListener("wheel", hold)
      el.removeEventListener("touchmove", hold)
      el.removeEventListener("pointerdown", hold)
    }
  }, [])

  // Auto-advance one card every 2s; pause on hover / touch, off screen, or
  // while the tab is hidden (a backgrounded tab freezes timers unevenly, so it
  // would otherwise fire a burst of steps on return).
  useEffect(() => {
    if (paused || !onScreen || items.length <= 1) return
    const id = window.setInterval(() => {
      const el = ref.current
      if (!el || document.hidden || performance.now() < holdUntil.current) return
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" })
      else scrollByCard(1)
    }, 2000)
    return () => window.clearInterval(id)
  }, [paused, onScreen, items.length])

  return (
    <div
      className="group relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={ref}
        // `snap-proximity`, not `snap-mandatory`: mandatory makes the browser
        // land on a snap point after every layout change or interrupted
        // gesture, which yanked the strip sideways mid-swipe. Proximity snaps
        // when you release near a card and leaves it alone otherwise.
        className="flex snap-x snap-proximity gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        // touchAction stays `auto`: a `pan-x` container strips vertical panning
        // from touches that begin on it, freezing page scroll when a finger
        // lands on a card. `auto` lets the browser pick — horizontal → carousel,
        // vertical → page.
        style={{ touchAction: "auto" }}
      >
        {items.map((r, i) => (
          <div
            key={r.id}
            data-card
            className="w-[80vw] max-w-[440px] shrink-0 snap-start sm:w-[46vw] lg:w-[31%]"
          >
            <RealisationCard
              realisation={r}
              index={i}
              ratio="aspect-[4/3]"
              layout="carousel"
              priority={!!aboveFold && i === 0}
              href={cardHref?.(r)}
              onSelect={select(onSelect, r)}
              onEdit={edit(onEdit, r.id)}
              noMargin
            />
          </div>
        ))}
      </div>

      {/* Prev/next — visible only on hover, and hidden on mobile (swipe instead). */}
      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        aria-label="Précédent"
        className="absolute left-2 top-[38%] hidden -translate-y-1/2 place-items-center rounded-full bg-foreground/70 p-3 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-foreground group-hover:opacity-100 sm:grid"
      >
        <CaretLeft size={20} weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        aria-label="Suivant"
        className="absolute right-2 top-[38%] hidden -translate-y-1/2 place-items-center rounded-full bg-foreground/70 p-3 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-foreground group-hover:opacity-100 sm:grid"
      >
        <CaretRight size={20} weight="bold" />
      </button>
    </div>
  )
}
