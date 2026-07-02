import { SlotParallaxImage } from "@/components/sections/SlotParallaxImage"
import { imageUrl } from "@/content/image"
import { DEFAULT_APROPOS_LAYOUT, type AProposLayout } from "@/lib/layouts"

// Page /a-propos — the image arrangement is admin-selectable (apropos.layout):
//   • bento     — asymmetric two-column editorial (default, text interleaved)
//   • uniform   — equal tiles in a grid
//   • editorial — centered single column of stacked images
//   • gallery   — full-width stacked images
// All variants keep the same 5 editable slots and are fully responsive.

const SECTION = "a-propos"

const SLOTS = {
  atelier: { slot: "atelier-large", seed: "ecl-about-atelier-large", alt: "Atelier de fabrication métallique", w: 1200, h: 1500 },
  soudure: { slot: "soudure-tig", seed: "ecl-about-soudure-tig", alt: "Soudure TIG sur inox", w: 900, h: 900 },
  decoupe: { slot: "decoupe-laser", seed: "ecl-about-decoupe-laser", alt: "Découpe laser de précision", w: 900, h: 900 },
  finitions: { slot: "finitions-poli", seed: "ecl-about-finitions-poli", alt: "Finition et polissage en atelier", w: 1200, h: 1500 },
  equipe: { slot: "equipe-plancher", seed: "ecl-about-equipe-plancher", alt: "Équipe au plancher de l'atelier", w: 900, h: 900 },
} as const

type SlotDef = (typeof SLOTS)[keyof typeof SLOTS]

const INTRO =
  "Fondée à Québec, Entreprises Christian Lemelin conçoit, fabrique et installe des ouvrages métalliques sur mesure. De la pièce unique à la grande série, nous mettons la même exigence dans chaque projet."
const ATELIER_P1 =
  "Notre atelier réunit découpe laser et plasma, postes de soudure certifiés et finition complète sous un même toit. Cette intégration nous permet de maîtriser chaque étape, du plan à la pose."
const ATELIER_P2 =
  "Soudeurs, machinistes et installateurs expérimentés y travaillent l’inox, l’acier, l’aluminium, le laiton et le cuivre avec une précision constante — partout au Québec."

function Frame({
  s,
  src,
  ratio,
  sizes,
}: {
  s: SlotDef
  src: string
  ratio: string
  sizes: string
}) {
  return (
    <div className={`relative ${ratio} overflow-hidden rounded-2xl border border-border`}>
      <SlotParallaxImage section={SECTION} slot={s.slot} src={src} alt={s.alt} sizes={sizes} />
    </div>
  )
}

export function APropos({
  images = {},
  layout = DEFAULT_APROPOS_LAYOUT,
}: {
  images?: Record<string, string>
  layout?: AProposLayout
}) {
  const src = (s: SlotDef) => images[s.slot] ?? imageUrl({ seed: s.seed, alt: s.alt }, s.w, s.h)

  const heading = (
    <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-foreground">
      Le métal, notre métier depuis 40 ans.
    </h1>
  )
  const atelier = (
    <div>
      <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-tight text-foreground">
        L’atelier
      </h2>
      <p className="mt-5 max-w-[46ch] leading-relaxed text-foreground-muted">{ATELIER_P1}</p>
      <p className="mt-4 max-w-[46ch] leading-relaxed text-foreground-muted">{ATELIER_P2}</p>
    </div>
  )

  return (
    <section
      id="a-propos"
      data-header-theme="light"
      className="bg-background pb-24 pt-32 md:pb-32 md:pt-40"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {layout === "bento" ? (
          // Two staggered editorial columns with the text interleaved (default).
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-10">
              <div>
                {heading}
                <p className="mt-6 max-w-[48ch] leading-relaxed text-foreground-muted">{INTRO}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Frame s={SLOTS.atelier} src={src(SLOTS.atelier)} ratio="aspect-[3/4]" sizes="(min-width:1024px) 25vw, 45vw" />
                <div className="flex flex-col gap-4">
                  <Frame s={SLOTS.soudure} src={src(SLOTS.soudure)} ratio="aspect-square" sizes="(min-width:1024px) 25vw, 45vw" />
                  <Frame s={SLOTS.decoupe} src={src(SLOTS.decoupe)} ratio="aspect-square" sizes="(min-width:1024px) 25vw, 45vw" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-10 lg:mt-32">
              <div className="grid grid-cols-2 gap-4">
                <Frame s={SLOTS.finitions} src={src(SLOTS.finitions)} ratio="aspect-[3/4]" sizes="(min-width:1024px) 25vw, 45vw" />
                <div className="flex flex-col gap-4">
                  <Frame s={SLOTS.equipe} src={src(SLOTS.equipe)} ratio="aspect-square" sizes="(min-width:1024px) 25vw, 45vw" />
                </div>
              </div>
              {atelier}
            </div>
          </div>
        ) : (
          <>
            <div className="max-w-[60ch]">
              {heading}
              <p className="mt-6 leading-relaxed text-foreground-muted">{INTRO}</p>
            </div>

            <div className="mt-12 md:mt-16">
              {layout === "uniform" && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {Object.values(SLOTS).map((s) => (
                    <Frame key={s.slot} s={s} src={src(s)} ratio="aspect-[4/3]" sizes="(min-width:768px) 33vw, 50vw" />
                  ))}
                </div>
              )}

              {layout === "editorial" && (
                <div className="mx-auto flex max-w-[860px] flex-col gap-6">
                  {Object.values(SLOTS).map((s, i) => (
                    <Frame
                      key={s.slot}
                      s={s}
                      src={src(s)}
                      ratio={i % 2 === 0 ? "aspect-[16/10]" : "aspect-[4/3]"}
                      sizes="(min-width:860px) 860px, 100vw"
                    />
                  ))}
                </div>
              )}

              {layout === "gallery" && (
                <div className="flex flex-col gap-6 md:gap-8">
                  {Object.values(SLOTS).map((s) => (
                    <Frame key={s.slot} s={s} src={src(s)} ratio="aspect-[16/9] md:aspect-[21/9]" sizes="100vw" />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-16 md:mt-20">{atelier}</div>
          </>
        )}
      </div>
    </section>
  )
}
