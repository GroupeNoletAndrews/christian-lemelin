import type { Metadata } from "next"
import { APropos } from "@/components/sections/APropos"
import { ContactCTA } from "@/components/sections/ContactCTA"

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Entreprises Christian Lemelin — atelier de fabrication métallique sur mesure à Québec depuis des décennies. Inox, acier, aluminium, laiton et cuivre.",
}

export default function AProposPage() {
  return (
    <>
      <APropos />
      <ContactCTA />
    </>
  )
}
 