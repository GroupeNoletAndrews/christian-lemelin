import type { ContactInfo } from "./types"

// Coordonnées officielles (brochure corporative). SOURCE UNIQUE pour le Header,
// le Footer, ContactCTA et la page /contact — ne jamais coder en dur ailleurs.
export const CONTACT: ContactInfo = {
  addressLine: "680, rue du Carbone",
  addressCity: "Québec, QC  G2N 2L3",
  phoneDisplay: "(418) 841-1220",
  phoneHref: "+14188411220",
  email: "info@eclemelin.com",
}

export const COMPANY = {
  legalName: "Entreprises Christian Lemelin Inc.",
  shortName: "Entreprises Christian Lemelin",
  tagline: "Fabrication métallique sur mesure — Québec",
}
