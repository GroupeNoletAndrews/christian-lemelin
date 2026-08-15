"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"
import { ArrowLink } from "@/components/ui/ArrowLink"
import { SlotImage } from "@/components/sections/SlotImage"
import { mediaUrl, SITE_MEDIA } from "@/lib/media"
import { useLocale } from "@/components/providers/LocaleProvider"
import { t, tr, type LocalizedText } from "@/lib/i18n"

// « Mobilier hospitalier » was a single accordion line inside Savoir-faire; it
// is a whole line of business, so it now owns a section between Savoir-faire
// (dark) and Réalisations (light) — hence the light treatment here, keeping the
// page's dark/light alternation.
//
// The four photos are admin-editable slots (see sections-registry.ts →
// "mobilier-hospitalier"): one lead portrait plus a strip of three. Slot ids are
// permanent — they are half the SectionImage primary key AND the storage
// filename (photos/sections/mobilier-hospitalier/<slot>.jpg).
const SECTION = "mobilier-hospitalier"

const LEAD_SLOT = "poste-soins"
const STRIP_SLOTS = ["plan-travail", "armoire", "chariot"] as const

// Code defaults — real workshop photos already in the bucket, NOT picsum seeds.
// Must stay identical to the registry defaults, or the admin panel and the
// public page would show two different pictures for the same slot.
const DEFAULTS: Record<string, string> = {
  "poste-soins": mediaUrl(SITE_MEDIA.savoirFaire.mobilier),
  "plan-travail": mediaUrl(SITE_MEDIA.mobilierPlanTravail),
  armoire: mediaUrl(SITE_MEDIA.savoirFaire.fabrication),
  chariot: mediaUrl(SITE_MEDIA.savoirFaire.polissage),
}

const alts: Record<string, LocalizedText> = {
  "poste-soins": {
    fr: "Poste de soins en inox fabriqué sur mesure, en atelier",
    en: "Custom stainless steel care station on the shop floor",
  },
  // Les trois photos de la bande sont, pour l'instant, des photos d'atelier
  // réelles réutilisées : les alternatives restent donc volontairement
  // génériques (elles doivent rester justes après remplacement par le
  // propriétaire, les libellés de l'admin portant l'intention).
  "plan-travail": {
    fr: "Plan de travail en inox aux soudures meulées et arêtes adoucies",
    en: "Stainless steel worktop with ground welds and softened edges",
  },
  armoire: {
    fr: "Mobilier en inox fabriqué à l'atelier",
    en: "Stainless steel furniture built on the shop floor",
  },
  chariot: {
    fr: "Pièce en inox finie à l'atelier",
    en: "Finished stainless steel piece in the workshop",
  },
}

const points: { title: LocalizedText; body: LocalizedText }[] = [
  {
    title: { fr: "Inox 304 et 316L", en: "304 and 316L stainless" },
    body: {
      fr: "Surfaces continues, soudures meulées et angles adoucis : rien ne retient les résidus, tout se désinfecte au quotidien.",
      en: "Continuous surfaces, ground welds and softened edges: nothing traps residue, and everything can be disinfected daily.",
    },
  },
  {
    title: { fr: "Ergonomie du poste", en: "Workstation ergonomics" },
    body: {
      fr: "Hauteurs de travail, portées et dégagements calculés pour le geste réel, avec arêtes sûres et roulettes qui roulent droit.",
      en: "Working heights, reach and clearances set around the actual gesture, with safe edges and casters that track straight.",
    },
  },
  {
    title: { fr: "Ajusté à votre local", en: "Fitted to your room" },
    body: {
      fr: "Nous relevons les contraintes du local — colonnes, portes, prises, hauteurs — puis fabriquons la pièce à la dimension exacte.",
      en: "We survey the room's constraints — columns, doors, outlets, heights — then build the piece to the exact dimension.",
    },
  },
  {
    title: { fr: "Durabilité et conformité", en: "Durability and compliance" },
    body: {
      fr: "Un mobilier qui encaisse le lavage quotidien et les chocs de chariots, fabriqué selon les exigences de votre devis.",
      en: "Furniture that takes daily washdowns and cart impacts, built to the requirements written into your project specification.",
    },
  },
]

// Scroll reveal — a staggered fade-up per block, so the section assembles
// itself as it comes into view instead of being fully painted before you get
// there. `once` so it never replays on the way back up. Distances are small on
// purpose (DESIGN.md §1: « mouvement sobre »), and reduced-motion collapses
// everything to a plain fade.
const RISE: Variants = {
  hidden: { opacity: 0, y: 22 },
  shown: { opacity: 1, y: 0 },
}
const RISE_REDUCED: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1 } }
const EASE = [0.16, 1, 0.3, 1] as const
const VIEWPORT = { once: true, amount: 0.25 } as const

export function MobilierHospitalier({
  images = {},
}: {
  /** Published/staged slot overrides (resolveSectionImages). */
  images?: Record<string, string>
}) {
  const locale = useLocale()
  const reduce = useReducedMotion()
  const rise = reduce ? RISE_REDUCED : RISE
  // A block's index in its group drives its delay — the cheapest way to get a
  // cascade without a container/child variant tree.
  const step = (i: number) => ({ duration: 0.6, ease: EASE, delay: reduce ? 0 : i * 0.08 })

  return (
    <section
      id="mobilier-hospitalier"
      data-header-theme="light"
      className="bg-background py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* ── Split: the story on the left, the lead photo on the right ── */}
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-16">
          <div>
            <motion.h2
              variants={rise}
              initial="hidden"
              whileInView="shown"
              viewport={VIEWPORT}
              transition={step(0)}
              className="max-w-[16ch] font-display text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-foreground">
              {t(
                "Du mobilier hospitalier fait pour durer.",
                "Hospital furniture built to last.",
                locale,
              )}
            </motion.h2>
            <motion.p
              variants={rise}
              initial="hidden"
              whileInView="shown"
              viewport={VIEWPORT}
              transition={step(1)}
              className="mt-6 max-w-[58ch] text-lg leading-relaxed text-foreground-muted">
              {t(
                "Postes de soins, armoires, chariots, plans de travail et supports d'équipement : nous fabriquons en atelier le mobilier des hôpitaux, cliniques et laboratoires. Tout part de l'inox 304 ou 316L, découpé au laser, plié et soudé selon les plans du projet. Les soudures sont meulées et les arêtes adoucies, pour des surfaces qui se nettoient sans retenir la saleté.",
                "Care stations, cabinets, carts, worktops and equipment supports: we build the furniture that hospitals, clinics and laboratories run on. Everything starts from 304 or 316L stainless steel, laser-cut, bent and welded to the project drawings. Welds are ground back and edges softened, so every surface wipes down without trapping soil.",
                locale,
              )}
            </motion.p>
            <motion.p
              variants={rise}
              initial="hidden"
              whileInView="shown"
              viewport={VIEWPORT}
              transition={step(2)}
              className="mt-5 max-w-[58ch] leading-relaxed text-foreground-muted"
            >
              {t(
                "Chaque pièce est dessinée avec le personnel qui l'utilisera et ajustée au local qui l'accueille : hauteurs de travail, dégagements pour les civières, passages de câbles, roulettes ou fixation murale. Nous travaillons à partir de vos plans ou développons la pièce avec notre équipe technique.",
                "Every piece is drawn with the staff who will use it and fitted to the room that receives it: working heights, stretcher clearances, cable routing, casters or wall mounting. We build to your drawings, or develop the piece with our technical team.",
                locale,
              )}
            </motion.p>
            {/* The single link for this section. */}
            <motion.div
              variants={rise}
              initial="hidden"
              whileInView="shown"
              viewport={VIEWPORT}
              transition={step(3)}
            >
              <ArrowLink href="/solutions" className="mt-8 text-lg">
                {t("Voir nos solutions", "Explore our solutions", locale)}
              </ArrowLink>
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 1.04 }}
            whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-surface-elevated"
          >
            <SlotImage
              section={SECTION}
              slot={LEAD_SLOT}
              src={images[LEAD_SLOT] ?? DEFAULTS[LEAD_SLOT]}
              alt={tr(alts[LEAD_SLOT], locale)}
              sizes="(min-width: 1024px) 38vw, (min-width: 640px) 90vw, calc(100vw - 48px)"
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* ── What it actually means, on hairlines ── */}
        <div className="mt-16 grid gap-x-10 border-t border-border sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p, i) => (
            <motion.div
              key={tr(p.title, "fr")}
              variants={rise}
              initial="hidden"
              whileInView="shown"
              viewport={VIEWPORT}
              transition={step(i)}
              className="border-b border-border py-6 lg:border-b-0 lg:pr-6"
            >
              <h3 className="font-display text-lg font-medium leading-snug text-foreground">
                {tr(p.title, locale)}
              </h3>
              <p className="mt-2 max-w-[36ch] leading-relaxed text-foreground-muted">
                {tr(p.body, locale)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Supporting strip ── */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
          {STRIP_SLOTS.map((slot, i) => (
            <motion.div
              key={slot}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 1.03 }}
              whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, ease: EASE, delay: reduce ? 0 : i * 0.1 }}
              className="group relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-surface-elevated sm:aspect-[4/3]"
            >
              <SlotImage
                section={SECTION}
                slot={slot}
                src={images[slot] ?? DEFAULTS[slot]}
                alt={tr(alts[slot], locale)}
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 31vw, calc(100vw - 48px)"
                className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.05]"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
