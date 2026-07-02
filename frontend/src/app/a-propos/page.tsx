import type { Metadata } from "next"
import { APropos } from "@/components/sections/APropos"
import { SectionStyleProvider } from "@/components/sections/SectionStyle"
import { resolveSectionImages, resolveSectionStyles } from "@/lib/server/sections"
import { getSiteSettings } from "@/lib/server/site-settings"
import { SETTING_KEYS, asAProposLayout } from "@/lib/layouts"

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Entreprises Christian Lemelin — atelier de fabrication métallique sur mesure à Québec depuis des décennies. Inox, acier, aluminium, laiton et cuivre.",
}

// Reads published À-propos image overrides + presentation + layout at request time.
export const dynamic = "force-dynamic"

export default async function AProposPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string; layout?: string }>
}) {
  const sp = await searchParams
  const [images, styles, settings] = await Promise.all([
    resolveSectionImages("a-propos"),
    resolveSectionStyles("a-propos"),
    getSiteSettings([SETTING_KEYS.aproposLayout]),
  ])
  const saved = asAProposLayout(settings[SETTING_KEYS.aproposLayout])
  const layout = sp.preview ? asAProposLayout(sp.layout ?? saved) : saved
  return (
    <SectionStyleProvider styles={styles}>
      <APropos images={images} layout={layout} />
    </SectionStyleProvider>
  )
}
 