"use client"

import { FABRICATION } from "@/content"
import { RevealRow } from "@/components/ui/RevealRow"

// « Cinq raisons essentielles » — sans numéro ni badge. Titre collant à gauche,
// liste éditoriale qui défile à droite : chaque ligne (hairline + titre +
// paragraphe) se révèle au scroll via RevealRow. Voir DESIGN.md §7.
export function ReasonsReveal() {
  const { raisonsHeading, raisonsIntro, raisons } = FABRICATION

  return (
    <section data-header-theme="light" className="bg-background py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-foreground">
              {raisonsHeading}
            </h2>
            <p className="mt-6 max-w-[40ch] leading-relaxed text-foreground-muted">
              {raisonsIntro}
            </p>
          </div>

          <div>
            {raisons.map((r) => (
              <RevealRow key={r.title} className="last:border-b last:border-border">
                <div className="py-9 md:py-12">
                  <h3 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-tight tracking-[-0.01em] text-foreground">
                    {r.title}
                  </h3>
                  <p className="mt-3 max-w-[54ch] leading-relaxed text-foreground-muted">
                    {r.body}
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
