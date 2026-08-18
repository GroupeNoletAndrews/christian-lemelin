// Shapes for the hardcoded marketing content (src/content/*). Consumed only by
// server components → zero client-bundle cost. Images are picsum seeds resolved
// via image.ts (the site-wide placeholder convention). See DESIGN.md.
//
// Les champs de texte sont typés `LocalizedText` (string FR OU { fr, en }) pour
// permettre une traduction bilingue progressive ; on les rend via tr(x, locale).

import type { LocalizedText } from "@/lib/i18n"

export interface ImageRef {
  /** picsum seed, e.g. "ecl-inox-hero". */
  seed: string
  /** alt reste une string simple (peu utile à traduire, évite du bruit partout). */
  alt: string
  /** Render in monochrome (?grayscale) — used for the moody full-bleed treatments. */
  grayscale?: boolean
}

export interface CTA {
  heading: LocalizedText
  body: LocalizedText
  href: string
  label: LocalizedText
}

/** A content section rendered generically by ContentBlocks.tsx. No badges,
 *  no numbering — lists are hairline rows, sections open on their title. */
export type ContentBlock =
  | { kind: "prose"; heading?: LocalizedText; paragraphs: LocalizedText[] }
  | {
      kind: "list"
      heading?: LocalizedText
      intro?: LocalizedText
      items: { title: LocalizedText; body?: LocalizedText }[]
    }
  | { kind: "properties"; heading?: LocalizedText; items: { label: LocalizedText; value: LocalizedText }[] }
  | { kind: "gallery"; heading?: LocalizedText; images: ImageRef[] }
  | {
      kind: "split"
      heading: LocalizedText
      paragraphs: LocalizedText[]
      image: ImageRef
      reverse?: boolean
    }
  | {
      // Dark, full-width "expertise" block (bg-ink) — the PDF's dark sections.
      kind: "feature"
      heading: LocalizedText
      intro?: LocalizedText
      image: ImageRef
      points: { title: LocalizedText; body?: LocalizedText }[]
    }

export interface DetailHero {
  heading: LocalizedText
  intro: LocalizedText
  image: ImageRef
}

export interface SolutionIndexEntry {
  slug: string
  title: LocalizedText
  tagline: LocalizedText
  hoverImage: ImageRef
}

export interface SolutionDetail {
  slug: string
  title: LocalizedText
  metaDescription: LocalizedText
  hero: DetailHero
  blocks: ContentBlock[]
  /** Material slugs to cross-link at the bottom. */
  relatedMaterials?: string[]
  /** Show the pinned réalisations strip. */
  showRealisations?: boolean
  cta?: CTA
  /** false = copy synthesized in-voice (no source PDF) — flag for review. */
  hasSourceCopy: boolean
}

export interface MaterialDetail {
  slug: string
  code: string
  /** Nuances / alliages réellement travaillés en atelier — ex. ["316", "304-4"].
   *  Affichées dans la liste récap du carousel matériaux et dans son modal. */
  grades?: string[]
  /** Canonical name (footer, detail hero, cross-links) — e.g. "Acier inoxydable". */
  name: LocalizedText
  /** Compact label (home carousel, switcher list) — e.g. "Inox". */
  shortName: LocalizedText
  /** Descriptive subtitle — e.g. "Inox 304 / 316L". */
  fullName: LocalizedText
  metaDescription: LocalizedText
  /** Short blurb reused by the fabrication switcher, home carousel & index. */
  blurb: LocalizedText
  /** Short property chips (home Materiaux carousel uses these). */
  properties: LocalizedText[]
  /** Portrait image for the carousel card / switcher list. */
  cardImage: ImageRef
  hero: DetailHero
  blocks: ContentBlock[]
  relatedSolutions?: string[]
  hasSourceCopy: boolean
}

export interface Reason {
  title: LocalizedText
  body: LocalizedText
}

export interface FabricationContent {
  hero: { heading: LocalizedText; intro: LocalizedText; points: LocalizedText[] }
  raisonsHeading: LocalizedText
  raisonsIntro: LocalizedText
  raisons: Reason[]
  showcase: { heading: LocalizedText; intro: LocalizedText; materialSlugs: string[] }
  cta?: CTA
}

export interface SolutionsOverviewContent {
  hero: {
    heading: LocalizedText
    intro: LocalizedText
    points: { title: LocalizedText; body: LocalizedText }[]
  }
  index: SolutionIndexEntry[]
  closing: { heading: LocalizedText }
}

export interface InstallationsContent {
  hero: DetailHero
  capabilities: { title: LocalizedText; body: LocalizedText }[]
  stats: { value: LocalizedText; label: LocalizedText }[]
  eco: {
    heading: LocalizedText
    intro: LocalizedText
    points: { title: LocalizedText; body: LocalizedText }[]
    image: ImageRef
  }
  partner: { heading: LocalizedText; body: LocalizedText; image: ImageRef }
  cta?: CTA
}

export interface ContactInfo {
  addressLine: string
  addressCity: string
  phoneDisplay: string
  phoneHref: string
  email: string
}
