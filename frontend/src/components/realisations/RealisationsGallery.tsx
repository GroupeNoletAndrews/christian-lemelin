"use client"

import { useSearchParams } from "next/navigation"
import { useAdmin } from "@/lib/admin-context"
import { RealisationsGrid } from "@/components/realisations/RealisationsGrid"
import { ArrowLink } from "@/components/ui/ArrowLink"
import type { RealisationsLayout } from "@/lib/layouts"

// In the content-workspace preview iframe, ask the parent admin window to open
// the editor for a réalisation (the in-place pencil affordance).
function postEditRealisation(id: string) {
  if (typeof window !== "undefined" && window.parent !== window) {
    window.parent.postMessage(
      { source: "cl-preview", type: "edit-realisation", id },
      window.location.origin,
    )
  }
}

export function RealisationsGallery({ layout }: { layout: RealisationsLayout }) {
  const { realisations, previewEdit } = useAdmin()
  const params = useSearchParams()
  const featuredId = params.get("featured")

  // Collection membership is independent of home pinning.
  const items = realisations.filter((r) => r.inCollection)

  if (items.length === 0) {
    return (
      <section className="bg-background py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-[-0.01em] text-foreground">
            Aucune réalisation pour le moment.
          </h2>
          <p className="mt-4 max-w-[48ch] leading-relaxed text-foreground-muted">
            Revenez bientôt pour découvrir nos projets récents — ou parlez-nous du vôtre.
          </p>
          <ArrowLink href="/contact" className="mt-6 text-lg">
            Démarrer un projet
          </ArrowLink>
        </div>
      </section>
    )
  }

  // In the editorial layout, float a deep-linked project (?featured=id, from the
  // home page) to the featured spot. Other layouts ignore it.
  let ordered = items
  if (layout === "editorial" && featuredId) {
    const lead = items.find((r) => r.id === featuredId)
    if (lead) ordered = [lead, ...items.filter((r) => r.id !== lead.id)]
  }

  return (
    <section className="bg-background pb-24 pt-4 md:pb-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <RealisationsGrid
          layout={layout}
          items={ordered}
          onEdit={previewEdit ? postEditRealisation : undefined}
        />
      </div>
    </section>
  )
}
