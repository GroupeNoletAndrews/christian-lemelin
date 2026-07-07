"use client"

import { useAdmin } from "@/lib/admin-context"
import { ArrowLink } from "@/components/ui/ArrowLink"
import { RealisationsGrid } from "@/components/realisations/RealisationsGrid"
import { DEFAULT_REALISATIONS_HOME_LAYOUT, type RealisationsLayout } from "@/lib/layouts"
import { useLocale } from "@/components/providers/LocaleProvider"
import { t } from "@/lib/i18n"

export function Realisations({
  layout = DEFAULT_REALISATIONS_HOME_LAYOUT,
}: {
  layout?: RealisationsLayout
}) {
  const locale = useLocale()
  const { realisations, maxPinned } = useAdmin()
  // Home membership = pinned, capped at the max.
  const pinned = realisations.filter((r) => r.pinned).slice(0, maxPinned)

  return (
    <section id="realisations" data-header-theme="light" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-foreground">
            {t("Quelques projets récents.", "A few recent projects.", locale)}
          </h2>
          <ArrowLink href="/realisations">{t("Voir tout", "View all", locale)}</ArrowLink>
        </div>

        <div className="mt-14">
          {pinned.length > 0 ? (
            <RealisationsGrid
              layout={layout}
              items={pinned}
              cardHref={(r) => `/realisations?featured=${r.id}`}
            />
          ) : (
            <p className="font-sans text-foreground-muted">
              {t(
                "Aucune réalisation épinglée pour le moment.",
                "No featured projects at the moment.",
                locale,
              )}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
