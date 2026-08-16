import { SlotParallaxImage } from "@/components/sections/SlotParallaxImage"
import { SlotImage } from "@/components/sections/SlotImage"
import { AProposStats } from "@/components/sections/AProposStats"
import { imageUrl } from "@/content/image"
import {
  COMPANY,
  APROPOS_SECTEURS,
  APROPOS_VALEURS,
  APROPOS_VALEURS_INTRO,
  APROPOS_TIMELINE,
  APROPOS_CITATION,
} from "@/content"
import { DEFAULT_APROPOS_LAYOUT, type AProposLayout } from "@/lib/layouts"
import { getLocale } from "@/lib/server/locale"
import { t, tr } from "@/lib/i18n"

// Page /a-propos — the image arrangement is admin-selectable (apropos.layout):
//   • bento     — asymmetric two-column editorial (default, text interleaved),
//                 ONE large picture per column: atelier-large + finitions-poli
//   • uniform   — equal tiles in a grid
//   • editorial — centered single column of stacked images
//   • gallery   — full-width stacked images
// All 5 slots stay editable in every variant; bento is the one that shows a
// chosen two of them (soudure-tig / decoupe-laser / equipe-plancher appear in
// the other three layouts). All variants are fully responsive.

const SECTION = "a-propos"

const SLOTS = {
  atelier: { slot: "atelier-large", seed: "ecl-about-atelier-large", alt: "Atelier de fabrication métallique", w: 1200, h: 1500 },
  soudure: { slot: "soudure-tig", seed: "ecl-about-soudure-tig", alt: "Soudure TIG sur inox", w: 900, h: 900 },
  decoupe: { slot: "decoupe-laser", seed: "ecl-about-decoupe-laser", alt: "Découpe laser de précision", w: 900, h: 900 },
  finitions: { slot: "finitions-poli", seed: "ecl-about-finitions-poli", alt: "Finition et polissage en atelier", w: 1200, h: 1500 },
  equipe: { slot: "equipe-plancher", seed: "ecl-about-equipe-plancher", alt: "Équipe au plancher de l'atelier", w: 900, h: 900 },
} as const

type SlotDef = (typeof SLOTS)[keyof typeof SLOTS]

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

export async function APropos({
  images = {},
  layout = DEFAULT_APROPOS_LAYOUT,
}: {
  images?: Record<string, string>
  layout?: AProposLayout
}) {
  const locale = await getLocale()
  const src = (s: SlotDef) => images[s.slot] ?? imageUrl({ seed: s.seed, alt: s.alt }, s.w, s.h)
  const portraitSrc =
    images["pdg-portrait"] ??
    imageUrl({ seed: "ecl-about-pdg-portrait", alt: "Christian Lemelin, président-directeur général" }, 720, 900)

  const INTRO = t(
    "Fondée à Québec, Entreprises Christian Lemelin conçoit, fabrique et installe des ouvrages métalliques sur mesure. De la pièce unique à la grande série, nous mettons la même exigence dans chaque projet.",
    "Founded in Québec City, Entreprises Christian Lemelin designs, fabricates and installs custom metalwork. From the single piece to large production runs, we bring the same standard of care to every project.",
    locale,
  )
  const ATELIER_P1 = t(
    "Notre atelier réunit découpe laser et plasma, postes de soudure certifiés et finition complète sous un même toit. Cette intégration nous permet de maîtriser chaque étape, du plan à la pose.",
    "Our workshop brings together laser and plasma cutting, certified welding stations and complete finishing under one roof. This integration lets us control every step, from drawing to installation.",
    locale,
  )
  const ATELIER_P2 = t(
    "Soudeurs, machinistes et installateurs expérimentés y travaillent l’inox, l’acier, l’aluminium, le laiton et le cuivre avec une précision constante — partout au Québec.",
    "Experienced welders, machinists and installers work stainless steel, steel, aluminium, brass and copper there with consistent precision — throughout Québec.",
    locale,
  )

  const heading = (
    <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-foreground">
      {t("Le métal, notre métier depuis 30 ans.", "Metal, our trade for 30 years.", locale)}
    </h1>
  )
  const atelier = (
    <div>
      <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-tight text-foreground">
        {t("L’atelier", "The workshop", locale)}
      </h2>
      <p className="mt-5 max-w-[46ch] leading-relaxed text-foreground-muted">{ATELIER_P1}</p>
      <p className="mt-4 max-w-[46ch] leading-relaxed text-foreground-muted">{ATELIER_P2}</p>
    </div>
  )

  return (
    <>
    <section
      id="a-propos"
      data-header-theme="light"
      className="bg-background pb-24 pt-32 md:pb-32 md:pt-40"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {layout === "bento" ? (
          // Two staggered editorial columns with the text interleaved (default),
          // ONE picture per column, each filling its column: the left side used
          // to stack three (a tall 3/4 beside two squares) and the right two, so
          // five thumbnails competed with the text and none of them was big
          // enough to show the work. The two remaining frames are the widest
          // photos on the page. The three slots dropped here are NOT deleted —
          // they stay editable and still render in the uniform / editorial /
          // gallery layouts (see the note in sections-registry.ts).
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-10">
              <div>
                {heading}
                <p className="mt-6 max-w-[48ch] leading-relaxed text-foreground-muted">{INTRO}</p>
              </div>
              <Frame s={SLOTS.atelier} src={src(SLOTS.atelier)} ratio="aspect-[4/3]" sizes="(min-width:1024px) 44vw, calc(100vw - 48px)" />
            </div>
            <div className="flex flex-col gap-10 lg:mt-32">
              <Frame s={SLOTS.finitions} src={src(SLOTS.finitions)} ratio="aspect-[4/3]" sizes="(min-width:1024px) 44vw, calc(100vw - 48px)" />
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

      {/* Nos performances en chiffres */}
      <section data-header-theme="light" className="bg-background">
        <div className="mx-auto max-w-[1400px] border-t border-border px-6 py-20 md:px-12 md:py-28">
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-tight text-foreground">
            {t("Nos performances en chiffres", "Our performance in numbers", locale)}
          </h2>
          <div className="mt-10 md:mt-14">
            <AProposStats />
          </div>
        </div>
      </section>

      {/* Nos secteurs d'activité */}
      <section data-header-theme="light" className="bg-background">
        <div className="mx-auto max-w-[1400px] border-t border-border px-6 py-20 md:px-12 md:py-28">
          <h2 className="max-w-[22ch] font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-tight text-foreground">
            {t("Nos secteurs d’activité", "Our sectors of activity", locale)}
          </h2>
          <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {APROPOS_SECTEURS.map((s) => (
              <div key={tr(s.group, locale)}>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                  {tr(s.group, locale)}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {s.items.map((it) => (
                    <li key={tr(it, locale)} className="leading-relaxed text-foreground-muted">
                      {tr(it, locale)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos valeurs fondamentales */}
      <section data-header-theme="light" className="bg-background">
        <div className="mx-auto max-w-[1400px] border-t border-border px-6 py-20 md:px-12 md:py-28">
          <div className="max-w-[60ch]">
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-tight text-foreground">
              {t("Nos valeurs fondamentales", "Our core values", locale)}
            </h2>
            <p className="mt-5 leading-relaxed text-foreground-muted">{tr(APROPOS_VALEURS_INTRO, locale)}</p>
          </div>
          <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-3">
            {APROPOS_VALEURS.map((v) => (
              <div key={tr(v.title, locale)} className="border-t border-border pt-6">
                <h3 className="font-display text-xl font-medium text-foreground">{tr(v.title, locale)}</h3>
                <p className="mt-3 leading-relaxed text-foreground-muted">{tr(v.body, locale)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chronologie */}
      <section data-header-theme="light" className="bg-background">
        <div className="mx-auto max-w-[1400px] border-t border-border px-6 py-20 md:px-12 md:py-28">
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-tight text-foreground">
            {t("Des jalons qui nous ont façonnés", "Milestones that shaped us", locale)}
          </h2>
          <div className="mt-10">
            {APROPOS_TIMELINE.map((j) => (
              <div
                key={j.year}
                className="grid grid-cols-[auto_1fr] items-center gap-6 border-t border-border py-6 md:gap-12"
              >
                <span className="font-display text-2xl font-semibold tabular-nums text-foreground md:text-3xl">
                  {j.year}
                </span>
                <span className="text-lg leading-snug text-foreground-muted">{tr(j.title, locale)}</span>
              </div>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      {/* Citation du président-directeur général */}
      <section data-header-theme="light" className="bg-background">
        <div className="mx-auto max-w-[1400px] border-t border-border px-6 py-20 md:px-12 md:py-28">
          <div className="grid gap-10 md:grid-cols-[auto_1fr] md:items-center md:gap-16">
            <div className="relative aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-2xl border border-border">
              <SlotImage
                section={SECTION}
                slot="pdg-portrait"
                src={portraitSrc}
                alt="Christian Lemelin, président-directeur général"
                sizes="(min-width:768px) 320px, 80vw"
              />
            </div>
            <figure>
              <blockquote className="font-display text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-[1.2] tracking-[-0.01em] text-foreground">
                «&nbsp;{tr(APROPOS_CITATION.quote, locale)}&nbsp;»
              </blockquote>
              <figcaption className="mt-8 leading-relaxed text-foreground-muted">
                <span className="font-medium text-foreground">{APROPOS_CITATION.author}</span>
                <br />
                {tr(APROPOS_CITATION.role, locale)}, {COMPANY.shortName}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
    </>
  )
}
