import { SITE_MEDIA } from "@/lib/media"
import { MATERIALS } from "@/content/materials"
import { SOLUTION_DETAILS, SOLUTIONS_OVERVIEW } from "@/content/solutions"
import type { ContentBlock } from "@/content/types"
import { FULL_CAPS, REFRAME_ONLY_CAPS, type SlotCaps } from "@/lib/section-style"

// Single registry of editable image slots per static section. Client+server safe
// (no DB, no secrets) so the admin UI, the resolver, and publish-revalidation all
// share it. `default` is the CODE default the resolver falls back to when no
// SectionImage override exists: a SITE_MEDIA storage KEY (source "site-media") or
// an ImageRef SEED (source "seed-manifest"). grayscale is a design intent kept in
// code (not user-editable).

export type SlotSource = "site-media" | "seed-manifest"

export interface SlotDef {
  id: string
  label: string
  source: SlotSource
  default: string
  grayscale?: boolean
  /** aspect-ratio hint shown in the admin panel so swaps crop sanely */
  aspect: string
}

export interface SectionDef {
  id: string
  label: string
  /** public route the workspace previews in the iframe */
  previewPath: string
  /** routes to revalidate on publish (where this section's images render) */
  revalidate: string[]
  /** which per-image controls the admin may use here (gated per section) */
  caps: SlotCaps
  slots: SlotDef[]
}

// ---- Shared slot-id helpers (generators AND components use these, no drift) ----
export const cardSlot = (slug: string) => `${slug}/card`
export const heroSlot = (slug: string) => `${slug}/hero`
export const hoverSlot = (slug: string) => `${slug}/hover`
export const gallerySlot = (slug: string, b: number, i: number) => `${slug}/g${b}-${i}`
export const featureSlot = (slug: string, b: number) => `${slug}/feature${b}`
export const splitSlot = (slug: string, b: number) => `${slug}/split${b}`

// Slots for the image-bearing content blocks of a detail page (gallery/feature/split).
function blockSlots(slug: string, blocks: ContentBlock[]): SlotDef[] {
  const out: SlotDef[] = []
  blocks.forEach((b, i) => {
    if (b.kind === "gallery") {
      b.images.forEach((img, j) =>
        out.push({
          id: gallerySlot(slug, i, j),
          label: `Galerie ${j + 1}`,
          source: "seed-manifest",
          default: img.seed,
          grayscale: img.grayscale,
          aspect: j % 4 === 0 ? "3/4" : "1/1",
        }),
      )
    } else if (b.kind === "feature") {
      out.push({
        id: featureSlot(slug, i),
        label: "Bloc sombre",
        source: "seed-manifest",
        default: b.image.seed,
        grayscale: b.image.grayscale,
        aspect: "1/1",
      })
    } else if (b.kind === "split") {
      out.push({
        id: splitSlot(slug, i),
        label: "Bloc image-texte",
        source: "seed-manifest",
        default: b.image.seed,
        grayscale: b.image.grayscale,
        aspect: "4/3",
      })
    }
  })
  return out
}

function buildMaterialSlots(): SlotDef[] {
  return MATERIALS.flatMap((m) => [
    { id: cardSlot(m.slug), label: `${m.name} — carte`, source: "seed-manifest" as const, default: m.cardImage.seed, grayscale: m.cardImage.grayscale, aspect: "4/5" },
    { id: heroSlot(m.slug), label: `${m.name} — héro`, source: "seed-manifest" as const, default: m.hero.image.seed, grayscale: m.hero.image.grayscale, aspect: "16/9" },
    ...blockSlots(m.slug, m.blocks),
  ])
}

function buildSolutionSlots(): SlotDef[] {
  const hoverBySlug = new Map(
    SOLUTIONS_OVERVIEW.index.map((e) => [e.slug, e.hoverImage]),
  )
  return SOLUTION_DETAILS.flatMap((s) => {
    const hover = hoverBySlug.get(s.slug)
    const slots: SlotDef[] = []
    if (hover)
      slots.push({ id: hoverSlot(s.slug), label: `${s.title} — aperçu`, source: "seed-manifest", default: hover.seed, grayscale: hover.grayscale, aspect: "4/5" })
    slots.push({ id: heroSlot(s.slug), label: `${s.title} — héro`, source: "seed-manifest", default: s.hero.image.seed, grayscale: s.hero.image.grayscale, aspect: "16/9" })
    slots.push(...blockSlots(s.slug, s.blocks))
    return slots
  })
}

export const SECTION_SLOTS: SectionDef[] = [
  {
    id: "savoir-faire",
    label: "Savoir-faire",
    previewPath: "/",
    revalidate: ["/"],
    caps: FULL_CAPS,
    slots: [
      { id: "mobilier", label: "Mobilier hospitalier", source: "site-media", default: SITE_MEDIA.savoirFaire.mobilier, grayscale: true, aspect: "16/10" },
      { id: "fabrication", label: "Fabrication sur mesure", source: "site-media", default: SITE_MEDIA.savoirFaire.fabrication, grayscale: true, aspect: "16/10" },
      { id: "decoupe-laser", label: "Découpe laser", source: "site-media", default: SITE_MEDIA.savoirFaire.decoupeLaser, grayscale: true, aspect: "16/10" },
      { id: "soudure", label: "Soudure & assemblage", source: "site-media", default: SITE_MEDIA.savoirFaire.soudure, grayscale: true, aspect: "16/10" },
      { id: "polissage", label: "Polissage & finitions", source: "site-media", default: SITE_MEDIA.savoirFaire.polissage, grayscale: true, aspect: "16/10" },
    ],
  },
  {
    id: "a-propos",
    label: "À propos",
    previewPath: "/a-propos",
    revalidate: ["/a-propos"],
    // Grille responsive figée : on ne recadre que la photo (pas de style ni de
    // changement de format).
    caps: REFRAME_ONLY_CAPS,
    slots: [
      { id: "atelier-large", label: "Atelier (grande)", source: "seed-manifest", default: "ecl-about-atelier-large", aspect: "3/4" },
      { id: "soudure-tig", label: "Soudure TIG", source: "seed-manifest", default: "ecl-about-soudure-tig", aspect: "1/1" },
      { id: "decoupe-laser", label: "Découpe laser", source: "seed-manifest", default: "ecl-about-decoupe-laser", aspect: "1/1" },
      { id: "finitions-poli", label: "Finitions & polissage", source: "seed-manifest", default: "ecl-about-finitions-poli", aspect: "3/4" },
      { id: "equipe-plancher", label: "Équipe au plancher", source: "seed-manifest", default: "ecl-about-equipe-plancher", aspect: "1/1" },
    ],
  },
  {
    id: "installations",
    label: "Installations",
    previewPath: "/installations",
    revalidate: ["/installations"],
    caps: FULL_CAPS,
    slots: [
      { id: "hero-aerial", label: "Vue aérienne (héro)", source: "seed-manifest", default: "ecl-install-hero-aerial", grayscale: true, aspect: "16/9" },
      { id: "eco-press", label: "Atelier éco (bloc sombre)", source: "seed-manifest", default: "ecl-install-eco-press", grayscale: true, aspect: "1/1" },
      { id: "partner-factory", label: "Usine partenaire", source: "seed-manifest", default: "ecl-install-partner-factory", aspect: "4/3" },
    ],
  },
  {
    id: "materiaux",
    label: "Matériaux",
    // Matériaux ne vit que sur l'accueil (la page /fabrication ne rend que du
    // texte). L'aperçu charge donc "/" et scrolle vers #materiaux.
    previewPath: "/",
    revalidate: ["/"],
    caps: FULL_CAPS,
    slots: buildMaterialSlots(),
  },
  {
    id: "solutions",
    label: "Solutions",
    previewPath: "/solutions",
    revalidate: ["/", "/solutions"],
    // Timeline animée : recadrage des photos uniquement.
    caps: REFRAME_ONLY_CAPS,
    slots: buildSolutionSlots(),
  },
]

export function getSection(id: string): SectionDef | undefined {
  return SECTION_SLOTS.find((s) => s.id === id)
}

export function getSlot(section: string, slot: string): SlotDef | undefined {
  return getSection(section)?.slots.find((s) => s.id === slot)
}

/** Storage key a published override for a slot is written to (overwrite in place).
 *  Photos are divided by section into their own folder. Slot ids can contain "/"
 *  (e.g. "acier-inoxydable/hero") — flattened to a single filename segment. */
export function sectionSlotKey(section: string, slot: string): string {
  return `photos/sections/${section}/${slot.replace(/\//g, "-")}.jpg`
}
