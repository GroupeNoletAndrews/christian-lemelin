"use client"

import { FABRICATION } from "@/content"
import { RevealRow } from "@/components/ui/RevealRow"
import { useLocale } from "@/components/providers/LocaleProvider"
import { tr } from "@/lib/i18n"

// « Cinq raisons essentielles » — sans numéro ni badge. Titre collant à gauche,
// liste éditoriale qui défile à droite : chaque ligne (hairline + titre +
// paragraphe) se révèle au scroll via RevealRow. Voir DESIGN.md §7.
export function ReasonsReveal() {
  const { raisonsHeading, raisonsIntro, raisons } = FABRICATION
  const locale = useLocale()

  return (
    <section data-header-theme="light" className="bg-background py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-foreground">
              {tr(raisonsHeading, locale)}
            </h2>
            <p className="mt-6 max-w-[40ch] leading-relaxed text-foreground-muted">
              {tr(raisonsIntro, locale)}
            </p>
          </div>

          <div>
            {raisons.map((r, i) => (
              <RevealRow key={i} className="last:border-b last:border-border">
                <div className="py-9 md:py-12">
                  <h3 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-tight tracking-[-0.01em] text-foreground">
                    {tr(r.title, locale)}
                  </h3>
                  <p className="mt-3 max-w-[54ch] leading-relaxed text-foreground-muted">
                    {tr(r.body, locale)}
                  </p>
                </div>
              </RevealRow>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
