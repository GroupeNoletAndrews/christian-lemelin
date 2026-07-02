import type { Metadata } from "next"
import { Suspense } from "react"
import { RealisationsGallery } from "@/components/realisations/RealisationsGallery"
import { getSiteSettings } from "@/lib/server/site-settings"
import {
  SETTING_KEYS,
  asRealisationsLayout,
  DEFAULT_REALISATIONS_COLLECTION_LAYOUT,
} from "@/lib/layouts"

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Nos projets en métal — de la cuisine professionnelle à la façade architecturale, fabriqués sur mesure dans nos ateliers à Québec.",
}

// Reads the collection layout choice at request time.
export const dynamic = "force-dynamic"

export default async function RealisationsPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string; layout?: string }>
}) {
  const sp = await searchParams
  const settings = await getSiteSettings([SETTING_KEYS.realisationsCollectionLayout])
  const saved = asRealisationsLayout(
    settings[SETTING_KEYS.realisationsCollectionLayout],
    DEFAULT_REALISATIONS_COLLECTION_LAYOUT,
  )
  // Admin preview may stage a layout via ?layout=… before publishing.
  const layout = sp.preview ? asRealisationsLayout(sp.layout, saved) : saved
  return (
    <div className="min-h-screen bg-background" data-header-theme="light">
      {/* Hero */}
      <section className="pb-10 pt-40 md:pb-14">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <h1 className="max-w-[16ch] font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.98] tracking-[-0.02em] text-foreground">
            Nos projets en métal.
          </h1>
          <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-foreground-muted">
            De la cuisine professionnelle à la façade architecturale, chaque projet est fabriqué
            sur mesure dans nos ateliers à Québec — inox, acier, aluminium, laiton et cuivre.
          </p>
        </div>
      </section>

      <Suspense>
        <RealisationsGallery layout={layout} />
      </Suspense>
    </div>
  )
}
