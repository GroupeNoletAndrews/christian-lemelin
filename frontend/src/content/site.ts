import type { ContactInfo } from "./types"
import type { Localized } from "@/lib/i18n"

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
  legalName: "Les Entreprises Christian Lemelin Inc.",
  shortName: "Entreprises Christian Lemelin",
  tagline: "Fabrication métallique sur mesure — Québec",
  // Licence de la Régie du bâtiment du Québec (mention légale obligatoire).
  rbq: "8223-2675-1",
}

// Heures d'ouverture de l'atelier (affichées discrètement au footer).
// Jours identiques regroupés pour rester compact. Bilingues (FR/EN).
export const HOURS: { days: Localized; hours: Localized }[] = [
  {
    days: { fr: "Lundi – Jeudi", en: "Monday – Thursday" },
    hours: { fr: "7 h 30 – 12 h · 12 h 30 – 16 h 15", en: "7:30 – 12 · 12:30 – 16:15" },
  },
  { days: { fr: "Vendredi", en: "Friday" }, hours: { fr: "7 h 30 – 12 h", en: "7:30 – 12" } },
  { days: { fr: "Samedi – Dimanche", en: "Saturday – Sunday" }, hours: { fr: "Fermé", en: "Closed" } },
]
