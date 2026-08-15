"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAdmin } from "@/lib/admin-context"
import { RealisationsGrid } from "@/components/realisations/RealisationsGrid"
import { RealisationLightbox } from "@/components/realisations/RealisationLightbox"
import { ArrowLink } from "@/components/ui/ArrowLink"
import { useLocale } from "@/components/providers/LocaleProvider"
import { t } from "@/lib/i18n"

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
  const locale = useLocale()
  const featuredId = params.get("featured")
  // Seeded from ?featured=<id> (a campaign / legacy deep link) so that project
  // opens straight into the viewer. Kept as an ID, not an object: réalisations
  // arrive asynchronously from the admin context, so the lookup below resolves
  // whenever they land — no effect, and closing it stays closed.
  const [openedId, setOpenedId] = useState<string | null>(featuredId)

  // Collection membership is independent of home pinning.
  const items = realisations.filter((r) => r.inCollection)
  const opened = items.find((r) => r.id === openedId) ?? null

  if (items.length === 0) {
    return (
      <section className="bg-background py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-[-0.01em] text-foreground">
            {t("Aucune réalisation pour le moment.", "No projects yet.", locale)}
          </h2>
          <p className="mt-4 max-w-[48ch] leading-relaxed text-foreground-muted">
            {t(
              "Revenez bientôt pour découvrir nos projets récents — ou parlez-nous du vôtre.",
              "Check back soon to discover our recent projects — or tell us about yours.",
              locale,
            )}
          </p>
          <ArrowLink href="/contact" className="mt-6 text-lg">
            {t("Démarrer un projet", "Start a project", locale)}
          </ArrowLink>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-background pb-24 pt-4 md:pb-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* A deep-linked project no longer floats to a "featured" slot — there
            is no featured slot any more: ?featured=<id> opens the viewer. */}
        <RealisationsGrid
          layout={layout}
          items={items}
          aboveFold
          onSelect={(r) => setOpenedId(r.id)}
          onEdit={previewEdit ? postEditRealisation : undefined}
        />
      </div>
      <RealisationLightbox realisation={opened} onClose={() => setOpenedId(null)} />
    </section>
  )
}
