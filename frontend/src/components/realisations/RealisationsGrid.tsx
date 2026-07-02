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
  /** Content-workspace preview: pencil to edit a réalisation in place. */
  onEdit?: (id: string) => void
}

export function RealisationsGrid({
  layout,
  ...props
}: GridProps & { layout: RealisationsLayout }) {
  if (props.items.length === 0) return null
  switch (layout) {
    case "uniform":
      return <UniformGrid {...props} />
    case "editorial":
      return <EditorialGrid {...props} />
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

function MasonryGrid({ items, cardHref, onEdit }: GridProps) {
  return (
    <div className="gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
      {items.map((r, i) => (
        <RealisationCard
          key={r.id}
          realisation={r}
          index={i}
          href={cardHref?.(r)}
          onEdit={edit(onEdit, r.id)}
        />
      ))}
    </div>
  )
}

function UniformGrid({ items, cardHref, onEdit }: GridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((r, i) => (
        <RealisationCard
          key={r.id}
          realisation={r}
          index={i}
          ratio="aspect-[4/3]"
          href={cardHref?.(r)}
          onEdit={edit(onEdit, r.id)}
          noMargin
        />
      ))}
    </div>
  )
}

function EditorialGrid({ items, cardHref, onEdit }: GridProps) {
  const [lead, ...rest] = items
  return (
    <div className="space-y-8">
      <RealisationCard
        realisation={lead}
        index={0}
        ratio="aspect-[16/10] md:aspect-[21/9]"
        href={cardHref?.(lead)}
        onEdit={edit(onEdit, lead.id)}
        noMargin
      />
      {rest.length > 0 && (
        <div className="gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
          {rest.map((r, i) => (
            <RealisationCard
              key={r.id}
              realisation={r}
              index={i + 1}
              href={cardHref?.(r)}
              onEdit={edit(onEdit, r.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CarouselGrid({ items, cardHref, onEdit }: GridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  const scrollByCard = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    const card = el.querySelector<HTMLElement>("[data-card]")
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: "smooth" })
  }

  // Auto-advance one card every 2s; pause on hover / touch.
  useEffect(() => {
    if (paused || items.length <= 1) return
    const id = window.setInterval(() => {
      const el = ref.current
      if (!el) return
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" })
      else scrollByCard(1)
    }, 2000)
    return () => window.clearInterval(id)
  }, [paused, items.length])

  return (
    <div
      className="group relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ touchAction: "pan-x" }}
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
              href={cardHref?.(r)}
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
