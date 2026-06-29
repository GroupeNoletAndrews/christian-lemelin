import { SlotParallaxImage } from "@/components/sections/SlotParallaxImage"
import { imageUrl } from "@/content/image"

// Page /a-propos — mise en page reprise du block shadcnblocks « about6 » :
// deux colonnes éditoriales décalées verticalement, chacune avec une grille
// d'images (2 sous-colonnes, ratios variés) + un bloc de texte. Adaptée au
// style OPUS (titres Onest casse normale, hairlines, pas de pilule) et au
// parallax maison. Voir DESIGN.md §7. Empile sur mobile (colonne gauche d'abord).

const SECTION = "a-propos"

// Cadre d'image OPUS : ratio + coins arrondis + hairline, avec parallax dedans.
// `src` est résolu côté serveur (override publié ?? défaut) ; éditable via slot.
function Frame({
  slot,
  src,
  alt,
  ratio,
}: {
  slot: string
  src: string
  alt: string
  ratio: string
}) {
  return (
    <div className={`relative ${ratio} overflow-hidden rounded-2xl border border-border`}>
      <SlotParallaxImage
        section={SECTION}
        slot={slot}
        src={src}
        alt={alt}
        sizes="(min-width: 1024px) 25vw, 45vw"
      />
    </div>
  )
}

export function APropos({ images = {} }: { images?: Record<string, string> }) {
  // Published override for a slot, else the original seed→manifest placeholder.
  const slotSrc = (slot: string, seed: string, alt: string, w: number, h: number) =>
    images[slot] ?? imageUrl({ seed, alt }, w, h)

  return (
    <section
      data-header-theme="light"
      className="bg-background pb-24 pt-32 md:pb-32 md:pt-40"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Colonne gauche — titre + intro, puis grille d'images */}
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-foreground">
                Le métal, notre métier depuis 40 ans.
              </h1>
              <p className="mt-6 max-w-[48ch] leading-relaxed text-foreground-muted">
                Fondée à Québec, Entreprises Christian Lemelin conçoit, fabrique
                et installe des ouvrages métalliques sur mesure. De la pièce
                unique à la grande série, nous mettons la même exigence dans
                chaque projet.
              </p>
            </div>

            {/* Grille d'images : sous-colonne haute + deux carrés empilés */}
            <div className="grid grid-cols-2 gap-4">
              <Frame
                ratio="aspect-[3/4]"
                slot="atelier-large"
                src={slotSrc("atelier-large", "ecl-about-atelier-large", "Atelier de fabrication métallique", 900, 1200)}
                alt="Atelier de fabrication métallique"
              />
              <div className="flex flex-col gap-4">
                <Frame
                  ratio="aspect-square"
                  slot="soudure-tig"
                  src={slotSrc("soudure-tig", "ecl-about-soudure-tig", "Soudure TIG sur inox", 900, 900)}
                  alt="Soudure TIG sur inox"
                />
                <Frame
                  ratio="aspect-square"
                  slot="decoupe-laser"
                  src={slotSrc("decoupe-laser", "ecl-about-decoupe-laser", "Découpe laser de précision", 900, 900)}
                  alt="Découpe laser de précision"
                />
              </div>
            </div>
          </div>

          {/* Colonne droite — décalée vers le bas (effet éditorial), grille puis texte */}
          <div className="flex flex-col gap-10 lg:mt-32">
            <div className="grid grid-cols-2 gap-4">
              <Frame
                ratio="aspect-[3/4]"
                slot="finitions-poli"
                src={slotSrc("finitions-poli", "ecl-about-finitions-poli", "Finition et polissage en atelier", 900, 1200)}
                alt="Finition et polissage en atelier"
              />
              <div className="flex flex-col gap-4">
                <Frame
                  ratio="aspect-square"
                  slot="equipe-plancher"
                  src={slotSrc("equipe-plancher", "ecl-about-equipe-plancher", "Équipe au plancher de l'atelier", 900, 900)}
                  alt="Équipe au plancher de l'atelier"
                />
              </div>
            </div>

            <div>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-tight text-foreground">
                L’atelier
              </h2>
              <p className="mt-5 max-w-[46ch] leading-relaxed text-foreground-muted">
                Notre atelier réunit découpe laser et plasma, postes de soudure
                certifiés et finition complète sous un même toit. Cette
                intégration nous permet de maîtriser chaque étape, du plan à la
                pose.
              </p>
              <p className="mt-4 max-w-[46ch] leading-relaxed text-foreground-muted">
                Soudeurs, machinistes et installateurs expérimentés y travaillent
                l’inox, l’acier, l’aluminium, le laiton et le cuivre avec une
                précision constante — partout au Québec.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
