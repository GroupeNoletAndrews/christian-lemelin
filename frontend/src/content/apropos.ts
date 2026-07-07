// Contenu éditorial de /a-propos — repris du site original (page « À propos »).
// SOURCE : docs/contenu-site-actuel.md §2. Faits (chiffres, valeurs, chronologie,
// citation du PDG, secteurs) conservés ; à faire valider par le client.

import type { LocalizedText } from "@/lib/i18n"

export interface AProposStat {
  value: string
  label: LocalizedText
}

export interface AProposValeur {
  title: LocalizedText
  body: LocalizedText
}

export interface AProposJalon {
  year: string
  title: LocalizedText
}

export interface AProposSecteur {
  group: LocalizedText
  items: LocalizedText[]
}

// « Nos performances en chiffres » — count-up sur /a-propos. Distinct de la
// StatsBar de l'accueil (métriques différentes : pièces/an, partenaires).
export const APROPOS_STATS: AProposStat[] = [
  { value: "30+", label: { fr: "Années d'expertise en fabrication métallique", en: "Years of expertise in metal fabrication" } },
  { value: "25 000+", label: { fr: "Pièces produites chaque année", en: "Parts produced every year" } },
  { value: "35+", label: { fr: "Partenaires nous font confiance", en: "Partners place their trust in us" } },
]

// « Nos secteurs d'activité » — taxonomie détaillée (4 groupes).
export const APROPOS_SECTEURS: AProposSecteur[] = [
  {
    group: { fr: "Industriels", en: "Industrial" },
    items: [
      { fr: "Aéronautique", en: "Aerospace" },
      { fr: "Construction & génie civil", en: "Construction & civil engineering" },
    ],
  },
  {
    group: { fr: "Institutionnels & publics", en: "Institutional & public" },
    items: [
      { fr: "Santé & hôpitaux", en: "Healthcare & hospitals" },
      { fr: "Éducation & recherche", en: "Education & research" },
      { fr: "Infrastructures publiques", en: "Public infrastructure" },
      { fr: "Gouvernement & défense", en: "Government & defence" },
    ],
  },
  {
    group: { fr: "Commerciaux & tertiaires", en: "Commercial & services" },
    items: [
      { fr: "Hôtellerie & restauration", en: "Hospitality & food service" },
      { fr: "Commerce & distribution", en: "Retail & distribution" },
      { fr: "Bureaux & espaces commerciaux", en: "Offices & commercial spaces" },
      { fr: "Mobilier sur mesure", en: "Custom furniture" },
    ],
  },
  {
    group: { fr: "Architecturaux & design", en: "Architectural & design" },
    items: [
      { fr: "Architecture & design intérieur", en: "Architecture & interior design" },
      { fr: "Immobilier", en: "Real estate" },
      { fr: "Événementiel & scénographie", en: "Events & scenography" },
    ],
  },
]

// « Nos valeurs fondamentales ».
export const APROPOS_VALEURS_INTRO: LocalizedText = {
  fr: "Nos valeurs ne définissent pas seulement notre entreprise : elles reflètent l'engagement de chaque personne qui contribue à notre succès.",
  en: "Our values don't merely define our company — they reflect the commitment of every person who contributes to our success.",
}

export const APROPOS_VALEURS: AProposValeur[] = [
  {
    title: { fr: "Vision audacieuse", en: "Bold vision" },
    body: {
      fr: "Nous repoussons les limites de l'innovation et de la performance.",
      en: "We push the boundaries of innovation and performance.",
    },
  },
  {
    title: { fr: "Excellence continue", en: "Continuous excellence" },
    body: {
      fr: "Nous améliorons constamment nos procédés afin d'offrir un service irréprochable.",
      en: "We constantly refine our processes to deliver impeccable service.",
    },
  },
  {
    title: { fr: "Force collaborative", en: "Collaborative strength" },
    body: {
      fr: "Chaque projet repose sur une communication claire et une collaboration efficace.",
      en: "Every project rests on clear communication and effective collaboration.",
    },
  },
]

// Chronologie (jalons).
export const APROPOS_TIMELINE: AProposJalon[] = [
  { year: "1995", title: { fr: "Déménagement au parc industriel", en: "Move to the industrial park" } },
  { year: "2016", title: { fr: "Expansion des capacités de production", en: "Expansion of production capacity" } },
  { year: "2020", title: { fr: "Intégration de nouvelles technologies", en: "Integration of new technologies" } },
]

// Citation du président-directeur général.
export const APROPOS_CITATION = {
  quote: {
    fr: "Depuis plus de 30 ans, nous plaçons l'innovation et la qualité au cœur de notre métier. Notre passion pour la transformation du métal nous permet de livrer des solutions adaptées aux besoins de nos clients, tout en repoussant les standards de l'industrie.",
    en: "For over 30 years, we have placed innovation and quality at the heart of our craft. Our passion for metalworking lets us deliver solutions tailored to our clients' needs, while continually raising the standards of the industry.",
  } satisfies LocalizedText,
  author: "Christian Lemelin",
  role: {
    fr: "Président-directeur général",
    en: "President and Chief Executive Officer",
  } satisfies LocalizedText,
}
