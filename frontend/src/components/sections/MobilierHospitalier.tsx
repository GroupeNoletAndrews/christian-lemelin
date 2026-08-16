"use client"

import { useCallback, useState } from "react"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { ArrowLink } from "@/components/ui/ArrowLink"
import { SlotImage } from "@/components/sections/SlotImage"
import { mediaUrl, SITE_MEDIA } from "@/lib/media"
import { useLocale } from "@/components/providers/LocaleProvider"
import { useSectionOrderOverride } from "@/lib/section-preview"
import { t, tr, type LocalizedText } from "@/lib/i18n"

// « Mobilier hospitalier » was a single accordion line inside Savoir-faire; it
// is a whole line of business, so it now owns a section between Savoir-faire
// (dark) and Réalisations (light) — hence the light treatment here, keeping the
// page's dark/light alternation.
//
// The photos are admin-editable slots (see sections-registry.ts →
// "mobilier-hospitalier"). They used to be a lead portrait plus a strip of three
// under the text; they now share ONE frame you page through.
//
// HOW MANY there are is the owner's call: the section is a `gallery` in the
// registry, so the admin adds and removes photos and `photos` below arrives
// already ordered from resolveSectionGallery(). Nothing here may assume four —
// or any other count. Slot ids are permanent (half the SectionImage primary key
// AND the storage filename), which is why the four originals keep theirs.
const SECTION = "mobilier-hospitalier"

const FALLBACK_SLOTS = ["poste-soins", "plan-travail", "armoire", "chariot"]

// Caption shown on the picture, for the four photos the site shipped with. A
// photo the owner ADDS has no caption — we show its position instead rather
// than invent a name for a piece we have never seen.
const CAPTIONS: Record<string, LocalizedText> = {
  "poste-soins": { fr: "Poste de soins", en: "Care station" },
  "plan-travail": { fr: "Plan de travail", en: "Worktop" },
  armoire: { fr: "Armoire", en: "Cabinet" },
  chariot: { fr: "Chariot", en: "Cart" },
}

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
  photos,
}: {
  /** Published/staged slot overrides (resolveSectionImages). */
  images?: Record<string, string>
  /** The owner's ordered photo list (resolveSectionGallery). Falls back to the
   *  four shipped slots so the section still renders if a caller forgets it. */
  photos?: { slot: string; url: string }[]
}) {
  const locale = useLocale()
  const reduce = useReducedMotion()
  const rise = reduce ? RISE_REDUCED : RISE
  // A block's index in its group drives its delay — the cheapest way to get a
  // cascade without a container/child variant tree.
  const step = (i: number) => ({ duration: 0.6, ease: EASE, delay: reduce ? 0 : i * 0.08 })

  // In the admin preview iframe, the owner's staged list wins: adding or
  // removing a photo changes the MEMBERSHIP, which no per-slot override could
  // express, so the workspace posts the whole order. Staged photos have no URL
  // yet — SlotImage picks up their data: URL from the same channel.
  const stagedOrder = useSectionOrderOverride(SECTION)
  const list = stagedOrder
    ? stagedOrder.map((slot) => ({ slot, url: "" }))
    : photos?.length
      ? photos
      : FALLBACK_SLOTS.map((slot) => ({ slot, url: "" }))
  const count = list.length
  const [active, setActive] = useState(0)
  const go = useCallback((dir: 1 | -1) => setActive((a) => (a + dir + count) % count), [count])
  // The owner can delete photos, so a stored index can outlive its photo.
  const index = Math.min(active, count - 1)
  const current = list[index]

  return (
    <section
      id="mobilier-hospitalier"
      data-header-theme="light"
      className="bg-background py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* ── Split: the story on the left, the lead photo on the right ── */}
        {/* The picture leads: it gets the WIDER column (~57%), the text ~43%.
            It used to be the other way round (1.15fr text / 0.85fr picture),
            which left the photo the narrower half of a section whose subject is
            what the furniture looks like. */}
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
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

          {/* ── The picture ── one frame, paged through. Same vocabulary as
              Savoir-faire just above (caption bottom-left, n / total
              bottom-right, arrows on the photo), so the two galleries on this
              page read as one control. */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 1.04 }}
            whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-surface-elevated"
          >
            {/* Every photo stays MOUNTED and they crossfade, rather than
                swapping the mounted slot: it keeps each `data-cl-slot` in the
                DOM, so the admin's in-place editor can target and preview any
                of them without paging to it first, and switching is instant.
                The owner controls the count, so this is a per-photo cost —
                fine for a handful, worth revisiting past a dozen or so. */}
            {list.map((p, i) => (
              <div
                key={p.slot}
                aria-hidden={i !== index}
                className={`absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none ${
                  i === index ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <SlotImage
                  section={SECTION}
                  slot={p.slot}
                  src={p.url || images[p.slot] || DEFAULTS[p.slot] || ""}
                  alt={tr(alts[p.slot] ?? alts["poste-soins"], locale)}
                  priority={i === 0}
                  sizes="(min-width: 1024px) 52vw, (min-width: 640px) 90vw, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>
            ))}

            {/* Caption scrim — just enough to carry the label. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
              {/* aria-live so paging is announced: the arrows change a picture,
                  which a screen reader would otherwise get nothing from. */}
              <p
                aria-live="polite"
                className="font-display text-base font-medium leading-tight text-white md:text-lg"
              >
                {CAPTIONS[current.slot]
                  ? tr(CAPTIONS[current.slot], locale)
                  : t(`Photo ${index + 1}`, `Photo ${index + 1}`, locale)}
              </p>
              {count > 1 && (
                <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
                  {index + 1} / {count}
                </p>
              )}
            </div>

            {/* Prev / next — on the picture itself, so it is obvious what they
                move. Gone when the owner has left a single photo: there would be
                nothing to page to. */}
            {count > 1 && (
              <div className="absolute right-3 top-3 flex gap-2 md:right-4 md:top-4">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t("Photo précédente", "Previous photo", locale)}
                  className="grid size-10 place-items-center rounded-full border border-white/25 bg-black/40 text-white/80 backdrop-blur-md transition-colors duration-200 hover:border-white/50 hover:bg-black/65 hover:text-white"
                >
                  <CaretLeft size={16} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t("Photo suivante", "Next photo", locale)}
                  className="grid size-10 place-items-center rounded-full border border-white/25 bg-black/40 text-white/80 backdrop-blur-md transition-colors duration-200 hover:border-white/50 hover:bg-black/65 hover:text-white"
                >
                  <CaretRight size={16} weight="bold" />
                </button>
              </div>
            )}
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

        {/* The strip of three photos that used to sit here now shares the frame
            above — see PHOTOS. */}
      </div>
    </section>
  )
}
