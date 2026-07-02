// Admin-selectable layout options for the réalisations grids and the À-propos
// page. Client + server safe (no DB). The chosen value is persisted in the
// SiteSetting key/value store (see lib/server/site-settings.ts) under the keys
// below; components fall back to the defaults when unset.

export const REALISATIONS_LAYOUTS = ["masonry", "uniform", "editorial", "carousel"] as const
export type RealisationsLayout = (typeof REALISATIONS_LAYOUTS)[number]

export const APROPOS_LAYOUTS = ["bento", "uniform", "editorial", "gallery"] as const
export type AProposLayout = (typeof APROPOS_LAYOUTS)[number]

export const DEFAULT_REALISATIONS_HOME_LAYOUT: RealisationsLayout = "masonry"
export const DEFAULT_REALISATIONS_COLLECTION_LAYOUT: RealisationsLayout = "editorial"
export const DEFAULT_APROPOS_LAYOUT: AProposLayout = "bento"

export const SETTING_KEYS = {
  realisationsHomeLayout: "realisations.layout.home",
  realisationsCollectionLayout: "realisations.layout.collection",
  aproposLayout: "apropos.layout",
} as const

export const REALISATIONS_LAYOUT_LABELS: Record<RealisationsLayout, string> = {
  masonry: "Masonry (colonnes)",
  uniform: "Grille uniforme",
  editorial: "Éditorial (vedette + petites)",
  carousel: "Carrousel horizontal",
}

export const APROPOS_LAYOUT_LABELS: Record<AProposLayout, string> = {
  bento: "Bento (asymétrique)",
  uniform: "Grille uniforme",
  editorial: "Colonne éditoriale",
  gallery: "Galerie pleine largeur",
}

export function asRealisationsLayout(
  v: string | null | undefined,
  fallback: RealisationsLayout,
): RealisationsLayout {
  return (REALISATIONS_LAYOUTS as readonly string[]).includes(v ?? "")
    ? (v as RealisationsLayout)
    : fallback
}

export function asAProposLayout(v: string | null | undefined): AProposLayout {
  return (APROPOS_LAYOUTS as readonly string[]).includes(v ?? "")
    ? (v as AProposLayout)
    : DEFAULT_APROPOS_LAYOUT
}
