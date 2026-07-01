import type { Metadata } from "next"
import { APropos } from "@/components/sections/APropos"
import { SectionStyleProvider } from "@/components/sections/SectionStyle"
import { resolveSectionImages, resolveSectionStyles } from "@/lib/server/sections"

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Entreprises Christian Lemelin — atelier de fabrication métallique sur mesure à Québec depuis des décennies. Inox, acier, aluminium, laiton et cuivre.",
}

// Reads published À-propos image overrides + presentation at request time.
export const dynamic = "force-dynamic"

export default async function AProposPage() {
  const [images, styles] = await Promise.all([
    resolveSectionImages("a-propos"),
    resolveSectionStyles("a-propos"),
  ])
  return (
    <SectionStyleProvider styles={styles}>
      <APropos images={images} />
    </SectionStyleProvider>
  )
}
 