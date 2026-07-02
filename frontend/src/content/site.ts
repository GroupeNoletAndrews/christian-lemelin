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

// Heures d'ouverture de l'atelier (affichées discrètement au footer).
// Jours identiques regroupés pour rester compact.
export const HOURS: { days: string; hours: string }[] = [
  { days: "Lundi – Jeudi", hours: "7 h 30 – 12 h · 12 h 30 – 16 h 15" },
  { days: "Vendredi", hours: "7 h 30 – 12 h" },
  { days: "Samedi – Dimanche", hours: "Fermé" },
]
