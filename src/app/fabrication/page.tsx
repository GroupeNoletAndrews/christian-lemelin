import type { Metadata } from "next"
import { FABRICATION } from "@/content"
import { ReasonsReveal } from "@/components/sections/ReasonsReveal"
import { MaterialSwitcher } from "@/components/sections/MaterialSwitcher"
import { ContactCTA } from "@/components/sections/ContactCTA"

export const metadata: Metadata = {
  title: "Fabrication sur mesure",
  description:
    "Fabrication métallique sur mesure à Québec : sélection rigoureuse des matériaux, finitions soignées et plus de 25 ans d'expertise. Inox, acier, aluminium, laiton et cuivre.",
}

export default function FabricationPage() {
  const { hero, cta } = FABRICATION

  return (
    <>
      {/* Hero */}
      <section data-header-theme="light" className="bg-background pb-8 pt-40 md:pb-12">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <h1 className="max-w-[18ch] font-display text-[clamp(2.5rem,7vw,5.25rem)] font-semibold leading-[1.0] tracking-[-0.02em] text-foreground">
            {hero.heading}
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-foreground-muted">
            {hero.intro}
          </p>
          <div className="mt-12 md:mt-16">
            {hero.points.map((p) => (
              <div key={p} className="border-t border-border py-5">
                <p className="max-w-[64ch] text-foreground">{p}</p>
              </div>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      <ReasonsReveal />
      <MaterialSwitcher />

      <ContactCTA
        heading={cta?.heading}
        body={cta?.body}
        label={cta?.label}
        href={cta?.href}
      />
    </>
  )
}
