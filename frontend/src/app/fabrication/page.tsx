import type { Metadata } from "next"
import { FABRICATION } from "@/content"
import { ReasonsReveal } from "@/components/sections/ReasonsReveal"
import { getLocale } from "@/lib/server/locale"
import { t, tr } from "@/lib/i18n"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: t("Fabrication sur mesure", "Custom fabrication", locale),
    description: t(
      "Fabrication métallique sur mesure à Québec : sélection rigoureuse des matériaux, finitions soignées et plus de 30 ans d'expertise. Inox, acier, aluminium, laiton et cuivre.",
      "Custom metal fabrication in Québec: rigorous material selection, refined finishes and over 30 years of expertise. Stainless steel, steel, aluminum, brass and copper.",
      locale,
    ),
  }
}

export default async function FabricationPage() {
  const { hero } = FABRICATION
  const locale = await getLocale()

  return (
    <>
      {/* Hero */}
      <section data-header-theme="light" className="bg-background pb-8 pt-40 md:pb-12">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <h1 className="max-w-[18ch] font-display text-[clamp(2.5rem,7vw,5.25rem)] font-semibold leading-[1.0] tracking-[-0.02em] text-foreground">
            {tr(hero.heading, locale)}
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-foreground-muted">
            {tr(hero.intro, locale)}
          </p>
          <div className="mt-12 md:mt-16">
            {hero.points.map((p, i) => (
              <div key={i} className="border-t border-border py-5">
                <p className="max-w-[64ch] text-foreground">{tr(p, locale)}</p>
              </div>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      <ReasonsReveal />
    </>
  )
}
