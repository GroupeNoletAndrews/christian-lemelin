import { ParallaxImage } from "@/components/ui/ParallaxImage"
import { imageUrl } from "@/content/image"

// Page /a-propos — mise en page reprise du block shadcnblocks « about6 » :
// deux colonnes éditoriales décalées verticalement, chacune avec une grille
// d'images (2 sous-colonnes, ratios variés) + un bloc de texte. Adaptée au
// style OPUS (titres Onest casse normale, hairlines, pas de pilule) et au
// parallax maison. Voir DESIGN.md §7. Empile sur mobile (colonne gauche d'abord).

// Cadre d'image OPUS : ratio + coins arrondis + hairline, avec parallax dedans.
function Frame({
  seed,
  alt,
  ratio,
  w,
  h,
}: {
  seed: string
  alt: string
  ratio: string
  w: number
  h: number
}) {
  return (
    <div className={`relative ${ratio} overflow-hidden rounded-2xl border border-border`}>
      <ParallaxImage
        src={imageUrl({ seed, alt }, w, h)}
        alt={alt}
        sizes="(min-width: 1024px) 25vw, 45vw"
      />
    </div>
  )
}

export function APropos() {
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
                seed="ecl-about-atelier-large"
                alt="Atelier de fabrication métallique"
                w={900}
                h={1200}
              />
              <div className="flex flex-col gap-4">
                <Frame
                  ratio="aspect-square"
                  seed="ecl-about-soudure-tig"
                  alt="Soudure TIG sur inox"
                  w={900}
                  h={900}
                />
                <Frame
                  ratio="aspect-square"
                  seed="ecl-about-decoupe-laser"
                  alt="Découpe laser de précision"
                  w={900}
                  h={900}
                />
              </div>
            </div>
          </div>

          {/* Colonne droite — décalée vers le bas (effet éditorial), grille puis texte */}
          <div className="flex flex-col gap-10 lg:mt-32">
            <div className="grid grid-cols-2 gap-4">
              <Frame
                ratio="aspect-[3/4]"
                seed="ecl-about-finitions-poli"
                alt="Finition et polissage en atelier"
                w={900}
                h={1200}
              />
              <div className="flex flex-col gap-4">
                <Frame
                  ratio="aspect-square"
                  seed="ecl-about-equipe-plancher"
                  alt="Équipe au plancher de l'atelier"
                  w={900}
                  h={900}
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
