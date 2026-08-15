"use client"

import { useCallback, useState } from "react"
import { Plus, CaretUp, CaretDown } from "@phosphor-icons/react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import { ArrowLink } from "@/components/ui/ArrowLink"
import { mediaUrl, SITE_MEDIA } from "@/lib/media"
import { SlotImage } from "@/components/sections/SlotImage"
import { useLocale } from "@/components/providers/LocaleProvider"
import { t, tr, type LocalizedText } from "@/lib/i18n"

const SECTION = "savoir-faire"

// Mobilier hospitalier used to be the first item here; it now has its own
// section (MobilierHospitalier) right below, because it deserved more than one
// line. Descriptions are deliberately concrete — the metal, the machine, the
// tolerance — rather than adjectives.
const services: {
  slot: string
  title: LocalizedText
  description: LocalizedText
  img: string
}[] = [
  {
    slot: "fabrication",
    title: { fr: "Fabrication sur mesure", en: "Custom fabrication" },
    description: {
      fr: "Pièce unique ou petite série : nous fabriquons selon vos plans, ou développons la pièce avec notre équipe quand le dessin n'existe pas. Découpe, pliage sur presse plieuse CNC, soudure et finition restent sous le même toit, en inox, acier, aluminium, laiton ou cuivre.",
      en: "One-off or small run: we build to your drawings, or develop the part with our team when no drawing exists yet. Cutting, CNC press-brake bending, welding and finishing all stay under one roof, in stainless steel, steel, aluminium, brass or copper.",
    },
    img: mediaUrl(SITE_MEDIA.savoirFaire.fabrication),
  },
  {
    slot: "decoupe-laser",
    title: { fr: "Découpe laser & Laser tube", en: "Laser cutting & tube laser" },
    description: {
      fr: "Deux machines, une même exigence : le laser plaque taille les développés dans toutes les épaisseurs, le laser tube débite tubes, profilés et carrés avec les perçages et les encoches déjà en place. Précision au dixième de millimètre, du prototype à la grande série.",
      en: "Two machines, one standard: the plate laser cuts flat blanks across every thickness, while the tube laser processes tube, profile and square stock with holes and notches already in place. Precision to a tenth of a millimetre, from prototype to high-volume production.",
    },
    img: mediaUrl(SITE_MEDIA.savoirFaire.decoupeLaser),
  },
  {
    slot: "soudure",
    title: { fr: "Soudure & assemblage", en: "Welding & assembly" },
    description: {
      fr: "Nos soudeurs certifiés travaillent au MIG, au TIG et en structural, selon le métal et le rendu attendu : cordon TIG discret sur l'inox à polir, MIG plus rapide sur l'acier, structural pour les charpentes et les mécanosoudés qui portent une charge.",
      en: "Our certified welders work in MIG, TIG and structural, chosen for the metal and the finish required: a discreet TIG bead on stainless that will be polished, faster MIG on steel, structural for load-bearing frames and welded assemblies.",
    },
    img: mediaUrl(SITE_MEDIA.savoirFaire.soudure),
  },
  {
    slot: "polissage",
    title: { fr: "Polissage & finitions", en: "Polishing & finishes" },
    description: {
      fr: "Miroir, satiné, brossé, poudré : la finition se choisit avec la pièce, car elle conditionne le nettoyage autant que le regard. Tout se fait en atelier — meulage des cordons, uniformisation du grain, protection — jusqu'à une surface constante sur toute la pièce.",
      en: "Mirror, satin, brushed, powder-coated: the finish is chosen with the part, because it governs cleaning as much as appearance. Everything happens in-house — grinding the welds, evening out the grain, protecting the surface — until the finish reads the same across the whole piece.",
    },
    img: mediaUrl(SITE_MEDIA.savoirFaire.polissage),
  },
]

// Apple "feature block" image crossfade — kept from skiper-ui Skiper76, but the
// photo now lives in its OWN framed panel instead of being a full-bleed backdrop
// buried under three black scrims: the picture was the thing you could least see
// in a section whose whole job is showing what we make. The new image enters
// from the right (+x) at scale 0.9 / opacity 0 and springs to rest after a
// ~0.16 s stagger, while the outgoing one slides left (-x) and fades.
const SLIDE = "8%" // horizontal travel, relative to the panel width (responsive)

const imageMotion: Variants = {
  initial: { opacity: 0, scale: 0.94, x: SLIDE },
  animate: {
    opacity: 1,
    scale: 1.04, // slight overscan so the slide never reveals a frame edge
    x: 0,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 20,
      mass: 0.9,
      delay: 0.16,
      opacity: { duration: 0.45, delay: 0.16 },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    x: `-${SLIDE}`,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 34,
      opacity: { duration: 0.32 },
    },
  },
}

const imageMotionReduced: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export function SavoirFaire({ images }: { images?: Record<string, string> }) {
  const locale = useLocale()
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const variants = reduce ? imageMotionReduced : imageMotion

  // Up/down carousel navigation — cycles through the services (wrap-around).
  const go = useCallback(
    (dir: 1 | -1) => setActive((a) => (a + dir + services.length) % services.length),
    [],
  )

  const current = services[active]

  return (
    <section
      id="savoir-faire"
      data-header-theme="dark"
      className="bg-background px-3 py-3 md:px-4 md:py-4"
    >
      {/* Rounded inset block — the cream page background shows around it. It
          used to be forced to a full 100svh, which left large empty bands above
          and below the content; it is now sized by what is in it. */}
      <div className="relative flex w-full overflow-hidden rounded-[1.75rem] bg-ink md:rounded-[2.5rem]">
        {/* Depth glow — neutral (the home page carries no blue, see DESIGN.md §2). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(75%_60%_at_78%_45%,rgba(255,255,255,0.08),transparent_70%)]"
        />

        {/* Content — text column + the picture panel it drives. */}
        <div className="relative z-10 flex w-full flex-col justify-center px-6 py-14 md:px-10 md:py-16 lg:px-16 lg:py-16 xl:px-20">
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-x-14 lg:gap-y-8">
            <h2 className="max-w-[18ch] font-display text-[clamp(2.1rem,4.6vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-white lg:col-start-1 lg:row-start-1">
              {t(
                "Voici comment nous donnons forme au métal.",
                "This is how we give metal its form.",
                locale,
              )}
            </h2>

            {/* ── The picture ── framed, sharp, and unmistakably tied to the
                selected item: it swaps with the Apple crossfade and captions
                itself. Sits between the title and the list on mobile. */}
            <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
              {/* Landscape on every breakpoint. It used to go 4/5 portrait on
                  desktop, which made the picture the tallest element on the
                  page (708 px at 1440) and drove the whole section's height. */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] ring-1 ring-white/15 md:rounded-[1.5rem]">
                <AnimatePresence initial={false} mode="sync">
                  <motion.div
                    key={active}
                    className="absolute inset-0 will-change-transform"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <SlotImage
                      section={SECTION}
                      slot={current.slot}
                      src={images?.[current.slot] ?? current.img}
                      alt={tr(current.title, locale)}
                      priority={active === 0}
                      sizes="(min-width: 1024px) 42vw, (min-width: 640px) 90vw, 100vw"
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Caption scrim — just enough to carry the label, no more. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
                  <p className="font-display text-base font-medium leading-tight text-white md:text-lg">
                    {tr(current.title, locale)}
                  </p>
                  <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
                    {active + 1} / {services.length}
                  </p>
                </div>

                {/* Prev / next — on the picture itself, so it is obvious what
                    they move. */}
                <div className="absolute right-3 top-3 flex gap-2 md:right-4 md:top-4">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label={t("Savoir-faire précédent", "Previous expertise", locale)}
                    className="grid size-10 place-items-center rounded-full border border-white/25 bg-black/40 text-white/80 backdrop-blur-md transition-colors duration-200 hover:border-white/50 hover:bg-black/65 hover:text-white"
                  >
                    <CaretUp size={16} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label={t("Savoir-faire suivant", "Next expertise", locale)}
                    className="grid size-10 place-items-center rounded-full border border-white/25 bg-black/40 text-white/80 backdrop-blur-md transition-colors duration-200 hover:border-white/50 hover:bg-black/65 hover:text-white"
                  >
                    <CaretDown size={16} weight="bold" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── The list ── */}
            <div className="lg:col-start-1 lg:row-start-2">
              <div className="flex flex-col gap-2">
                {services.map((s, i) => {
                  const isActive = i === active
                  const panelId = `savoir-faire-${s.slot}`
                  return (
                    // The description is a SIBLING of the button, not a child:
                    // inside it, the collapsed paragraph became part of the
                    // button's accessible name — a screen reader announced a
                    // ~290-character "button".
                    <div
                      key={s.slot}
                      className={`group rounded-[1.6rem] border px-5 py-3.5 backdrop-blur-md transition-[background-color,border-color] duration-300 ease-out md:px-6 ${
                        isActive
                          ? "border-white/25 bg-white/[0.07]"
                          : "border-white/12 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActive(i)}
                        aria-expanded={isActive}
                        aria-controls={panelId}
                        className="flex w-full cursor-pointer items-center gap-3.5 text-left"
                      >
                        <span
                          className={`grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                            isActive ? "bg-white/20" : "border border-white/25"
                          }`}
                        >
                          {isActive ? (
                            <span className="size-1.5 rounded-full bg-white" />
                          ) : (
                            <Plus
                              size={13}
                              weight="bold"
                              className="text-white/60 transition-colors group-hover:text-white"
                            />
                          )}
                        </span>
                        <span className="font-display text-lg font-medium leading-tight text-white md:text-xl">
                          {tr(s.title, locale)}
                        </span>
                      </button>

                      {/* Description — height-animated reveal (grid-rows trick) */}
                      <div
                        id={panelId}
                        className={`grid transition-[grid-template-rows,opacity] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="max-w-[46ch] pl-[2.375rem] pt-3 text-[15px] leading-relaxed text-white/70">
                            {tr(s.description, locale)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ONE link for the whole section (see DESIGN.md — link density).
                  It also has to live OUTSIDE the pills: an <a> nested in a
                  <button> was invalid HTML and stole the pill's click. */}
              <ArrowLink href="/fabrication" dark className="mt-8">
                {t(
                  "Découvrir notre fabrication sur mesure",
                  "Explore our custom fabrication",
                  locale,
                )}
              </ArrowLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
