import { Hero } from "@/components/sections/Hero"
import { SavoirFaire } from "@/components/sections/SavoirFaire"
import { Materiaux } from "@/components/sections/Materiaux"
import { Solutions } from "@/components/sections/Solutions"
import { Realisations } from "@/components/sections/Realisations"
import { StatsBar } from "@/components/sections/StatsBar"
import { ContactCTA } from "@/components/sections/ContactCTA"
import { SectionStyleProvider } from "@/components/sections/SectionStyle"
import { resolveSectionImages, resolveSectionStyles } from "@/lib/server/sections"

// Reads published section-image overrides + presentation at request time so admin
// publishes (Savoir-faire / Matériaux images + reframe/style) appear immediately.
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [
    savoirFaireImages,
    materiauxImages,
    savoirFaireStyles,
    materiauxStyles,
  ] = await Promise.all([
    resolveSectionImages("savoir-faire"),
    resolveSectionImages("materiaux"),
    resolveSectionStyles("savoir-faire"),
    resolveSectionStyles("materiaux"),
  ])
  return (
    <>
      <Hero />
      <StatsBar />
      <SectionStyleProvider styles={savoirFaireStyles}>
        <SavoirFaire images={savoirFaireImages} />
      </SectionStyleProvider>
      <Realisations />
      <Solutions />
      <SectionStyleProvider styles={materiauxStyles}>
        <Materiaux images={materiauxImages} />
      </SectionStyleProvider>
      <ContactCTA />
    </>
  )
}
