import { Hero } from "@/components/sections/Hero"
import { SavoirFaire } from "@/components/sections/SavoirFaire"
import { Materiaux } from "@/components/sections/Materiaux"
import { Solutions } from "@/components/sections/Solutions"
import { Realisations } from "@/components/sections/Realisations"
import { StatsBar } from "@/components/sections/StatsBar"
import { ContactCTA } from "@/components/sections/ContactCTA"
import { resolveSectionImages } from "@/lib/server/sections"

// Reads published section-image overrides at request time so admin publishes
// (Savoir-faire images) appear immediately.
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [savoirFaireImages, materiauxImages] = await Promise.all([
    resolveSectionImages("savoir-faire"),
    resolveSectionImages("materiaux"),
  ])
  return (
    <>
      <Hero />
      <StatsBar />
      <SavoirFaire images={savoirFaireImages} />
      <Realisations />
      <Solutions />
      <Materiaux images={materiauxImages} />
      <ContactCTA />
    </>
  )
}
