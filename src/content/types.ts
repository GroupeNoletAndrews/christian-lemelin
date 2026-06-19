// Shapes for the hardcoded marketing content (src/content/*). Consumed only by
// server components → zero client-bundle cost. Images are picsum seeds resolved
// via image.ts (the site-wide placeholder convention). See DESIGN.md.

export interface ImageRef {
  /** picsum seed, e.g. "ecl-inox-hero". */
  seed: string
  alt: string
  /** Render in monochrome (?grayscale) — used for the moody full-bleed treatments. */
  grayscale?: boolean
}

export interface CTA {
  heading: string
  body: string
  href: string
  label: string
}

/** A content section rendered generically by ContentBlocks.tsx. No badges,
 *  no numbering — lists are hairline rows, sections open on their title. */
export type ContentBlock =
  | { kind: "prose"; heading?: string; paragraphs: string[] }
  | {
      kind: "list"
      heading?: string
      intro?: string
      items: { title: string; body?: string }[]
    }
  | { kind: "properties"; heading?: string; items: { label: string; value: string }[] }
  | { kind: "gallery"; heading?: string; images: ImageRef[] }
  | {
      kind: "split"
      heading: string
      paragraphs: string[]
      image: ImageRef
      reverse?: boolean
    }
  | {
      // Dark, full-width "expertise" block (bg-ink) — the PDF's dark sections.
      kind: "feature"
      heading: string
      intro?: string
      image: ImageRef
      points: { title: string; body?: string }[]
    }

export interface DetailHero {
  heading: string
  intro: string
  image: ImageRef
}

export interface SolutionIndexEntry {
  slug: string
  title: string
  tagline: string
  hoverImage: ImageRef
}

export interface SolutionDetail {
  slug: string
  title: string
  metaDescription: string
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
  /** Canonical name (footer, detail hero, cross-links) — e.g. "Acier inoxydable". */
  name: string
  /** Compact label (home carousel, switcher list) — e.g. "Inox". */
  shortName: string
  /** Descriptive subtitle — e.g. "Inox 304 / 316L". */
  fullName: string
  metaDescription: string
  /** Short blurb reused by the fabrication switcher, home carousel & index. */
  blurb: string
  /** Short property chips (home Materiaux carousel uses these). */
  properties: string[]
  /** Portrait image for the carousel card / switcher list. */
  cardImage: ImageRef
  hero: DetailHero
  blocks: ContentBlock[]
  relatedSolutions?: string[]
  hasSourceCopy: boolean
}

export interface Reason {
  title: string
  body: string
}

export interface FabricationContent {
  hero: { heading: string; intro: string; points: string[] }
  raisonsHeading: string
  raisonsIntro: string
  raisons: Reason[]
  showcase: { heading: string; intro: string; materialSlugs: string[] }
  cta?: CTA
}

export interface SolutionsOverviewContent {
  hero: {
    heading: string
    intro: string
    points: { title: string; body: string }[]
  }
  index: SolutionIndexEntry[]
  closing: { heading: string }
}

export interface InstallationsContent {
  hero: DetailHero
  capabilities: { title: string; body: string }[]
  stats: { value: string; label: string }[]
  eco: {
    heading: string
    intro: string
    points: { title: string; body: string }[]
    image: ImageRef
  }
  partner: { heading: string; body: string; image: ImageRef }
  cta?: CTA
}

export interface ContactInfo {
  addressLine: string
  addressCity: string
  phoneDisplay: string
  phoneHref: string
  email: string
}
