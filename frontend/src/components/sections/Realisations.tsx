"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { useAdmin } from "@/lib/admin-context"
import { ArrowLink } from "@/components/ui/ArrowLink"
import { RealisationsGrid } from "@/components/realisations/RealisationsGrid"
import { RealisationLightbox } from "@/components/realisations/RealisationLightbox"
import { DEFAULT_REALISATIONS_HOME_LAYOUT, type RealisationsLayout } from "@/lib/layouts"
import { useLocale } from "@/components/providers/LocaleProvider"
import { t } from "@/lib/i18n"
import type { Realisation } from "@/types/admin"

export function Realisations({
  layout = DEFAULT_REALISATIONS_HOME_LAYOUT,
}: {
  layout?: RealisationsLayout
}) {
  const locale = useLocale()
  const { realisations, maxPinned } = useAdmin()
  const [opened, setOpened] = useState<Realisation | null>(null)
  const reduce = useReducedMotion()
  const reveal = reduce
    ? { initial: { opacity: 0 }, whileInView: { opacity: 1 } }
    : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 } }
  // Home membership = pinned, capped at the max.
  const pinned = realisations.filter((r) => r.pinned).slice(0, maxPinned)

  return (
    <section id="realisations" data-header-theme="light" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <motion.div
          {...reveal}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <h2 className="font-display text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-foreground">
            {t("Quelques projets récents.", "A few recent projects.", locale)}
          </h2>
          {/* The section's one link. The tiles themselves now OPEN the project
              instead of navigating, so this stays the only <a> in here. */}
          <ArrowLink href="/realisations">{t("Voir tout", "View all", locale)}</ArrowLink>
        </motion.div>

        <div className="mt-14">
          {pinned.length > 0 ? (
            <RealisationsGrid layout={layout} items={pinned} onSelect={setOpened} />
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
      <RealisationLightbox realisation={opened} onClose={() => setOpened(null)} />
    </section>
  )
}
