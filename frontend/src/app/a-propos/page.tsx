import type { Metadata } from "next"
import { APropos } from "@/components/sections/APropos"
import { ContactCTA } from "@/components/sections/ContactCTA"
import { resolveSectionImages } from "@/lib/server/sections"

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Entreprises Christian Lemelin — atelier de fabrication métallique sur mesure à Québec depuis des décennies. Inox, acier, aluminium, laiton et cuivre.",
}

// Reads published À-propos image overrides at request time (admin edits show immediately).
export const dynamic = "force-dynamic"

export default async function AProposPage() {
  const images = await resolveSectionImages("a-propos")
  return (
    <>
      <APropos images={images} />
      <ContactCTA />
    </>
  )
}
 