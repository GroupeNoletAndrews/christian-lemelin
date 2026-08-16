import { Hero } from "@/components/sections/Hero"
import { SavoirFaire } from "@/components/sections/SavoirFaire"
import { MobilierHospitalier } from "@/components/sections/MobilierHospitalier"
import { Materiaux } from "@/components/sections/Materiaux"
import { Solutions } from "@/components/sections/Solutions"
import { Realisations } from "@/components/sections/Realisations"
import { StatsBar } from "@/components/sections/StatsBar"
import { ContactCTA } from "@/components/sections/ContactCTA"
import { SectionStyleProvider } from "@/components/sections/SectionStyle"
import {
  resolveSectionGallery,
  resolveSectionImages,
  resolveSectionStyles,
} from "@/lib/server/sections"
import { getSiteSettings } from "@/lib/server/site-settings"
import {
  SETTING_KEYS,
  asRealisationsLayout,
  DEFAULT_REALISATIONS_HOME_LAYOUT,
} from "@/lib/layouts"

// Reads published section-image overrides + presentation at request time so admin
// publishes (Savoir-faire / Matériaux images + reframe/style) appear immediately.
export const dynamic = "force-dynamic"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string; rlayout?: string }>
}) {
  const sp = await searchParams
  const [
    savoirFaireImages,
    mobilierImages,
    mobilierPhotos,
    materiauxImages,
    savoirFaireStyles,
    mobilierStyles,
    materiauxStyles,
    settings,
  ] = await Promise.all([
    resolveSectionImages("savoir-faire"),
    resolveSectionImages("mobilier-hospitalier"),
    // Owner-controlled count + order — a record keyed by slot cannot carry it.
    resolveSectionGallery("mobilier-hospitalier"),
    resolveSectionImages("materiaux"),
    resolveSectionStyles("savoir-faire"),
    resolveSectionStyles("mobilier-hospitalier"),
    resolveSectionStyles("materiaux"),
    getSiteSettings([SETTING_KEYS.realisationsHomeLayout]),
  ])
  const savedHomeLayout = asRealisationsLayout(
    settings[SETTING_KEYS.realisationsHomeLayout],
    DEFAULT_REALISATIONS_HOME_LAYOUT,
  )
  // In the admin preview iframe, honour a staged (un-published) layout override.
  const homeLayout = sp.preview
    ? asRealisationsLayout(sp.rlayout, savedHomeLayout)
    : savedHomeLayout
  return (
    <>
      <Hero />
      <StatsBar />
      <SectionStyleProvider styles={savoirFaireStyles}>
        <SavoirFaire images={savoirFaireImages} />
      </SectionStyleProvider>
      {/* Own provider: the published-style context is keyed by SLOT id only, so
          sharing one provider between sections would cross the wires. */}
      <SectionStyleProvider styles={mobilierStyles}>
        <MobilierHospitalier images={mobilierImages} photos={mobilierPhotos} />
      </SectionStyleProvider>
      <Realisations layout={homeLayout} />
      <Solutions />
      <SectionStyleProvider styles={materiauxStyles}>
        <Materiaux images={materiauxImages} />
      </SectionStyleProvider>
      <ContactCTA />
    </>
  )
}
