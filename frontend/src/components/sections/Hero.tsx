"use client"

import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr"
import { mediaUrl, SITE_MEDIA } from "@/lib/media"
import { useLocale } from "@/components/providers/LocaleProvider"
import { t } from "@/lib/i18n"

// Full-bleed looping video hero (pointlaz-inspired) in our OPUS style.
// The video autoplays/loops with no controls. The text is rendered statically
// (no reveal animation) so it appears immediately and reliably on every load —
// the previous scramble/fade reveal depended on the Preloader's "done" event,
// which raced with mount and sometimes left the title blank after a refresh.
export function Hero() {
  const locale = useLocale()

  return (
    <section
      data-header-theme="dark"
      className="relative h-[100svh] w-full overflow-hidden bg-ink"
    >
      {/* Looping background video — no controls, no interaction */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={mediaUrl(SITE_MEDIA.heroVideo)} type="video/mp4" />
      </video>

      {/* Legibility gradient (dark at bottom for text, mild at top for the nav) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/40" />

      {/* Content — anchored bottom-left */}
      <div className="relative z-10 flex h-full flex-col justify-end">
        <div className="w-full px-6 pb-16 md:px-12 md:pb-24">
          {/* Title on two offset lines (OPUS) — plain static text. */}
          <h1 className="font-display text-[clamp(2.5rem,9vw,8rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white">
            <span className="block md:whitespace-nowrap">Les Entreprises</span>
            <span className="mt-1 block md:mt-2 md:whitespace-nowrap">
              Christian Lemelin
            </span>
          </h1>

          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end md:gap-12">
            <p className="max-w-[52ch] text-lg leading-relaxed text-white/80 md:text-xl">
              {t(
                "Atelier de fabrication métallique sur mesure à Québec. Inox, acier, aluminium, laiton et cuivre — travaillés avec la même exigence depuis plus de 30 ans.",
                "Custom metal fabrication workshop in Québec City. Stainless steel, steel, aluminium, brass and copper — worked with the same exacting standards for over 30 years.",
                locale,
              )}
            </p>
            <a
              href="/solutions"
              className="w-fit shrink-0 text-lg font-medium text-white underline decoration-2 underline-offset-[6px] decoration-white/80 transition-colors hover:decoration-white md:text-xl"
            >
              {t("Voir nos solutions", "Explore our solutions", locale)}
              <ArrowUpRight
                size={26}
                weight="bold"
                className="ml-2 inline align-middle text-accent"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
