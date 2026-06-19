import { Hero } from "@/components/sections/Hero"
import { SavoirFaire } from "@/components/sections/SavoirFaire"
import { Materiaux } from "@/components/sections/Materiaux"
import { Solutions } from "@/components/sections/Solutions"
import { Realisations } from "@/components/sections/Realisations"
import { StatsBar } from "@/components/sections/StatsBar"
import { ContactCTA } from "@/components/sections/ContactCTA"

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <SavoirFaire />
      <Realisations />
      <Solutions />
      <Materiaux />
      <ContactCTA />
    </>
  )
}
