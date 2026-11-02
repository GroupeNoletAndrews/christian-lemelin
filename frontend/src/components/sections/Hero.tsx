"use client"

import { useEffect, useRef } from "react"
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr"
import { imgSrc, SITE_MEDIA } from "@/lib/media"
import { useLocale } from "@/components/providers/LocaleProvider"
import { t } from "@/lib/i18n"

// When playback starts, counted from the moment the intro curtain begins to
// lift (it takes ~1s: 0.2s delay + 0.8s slide). Mid-slide, so the video is
// already moving as the hero comes into view — no visible freeze — while
// little of the opening is spent behind the curtain.
const PLAY_AFTER_INTRO_MS = 500

// Full-bleed looping video hero (pointlaz-inspired) in our OPUS style.
// The video autoplays/loops with no controls. The text is rendered statically
// (no reveal animation) so it appears immediately and reliably on every load —
// the previous scramble/fade reveal depended on the Preloader's "done" event,
// which raced with mount and sometimes left the title blank after a refresh.
export function Hero() {
  const locale = useLocale()

  // A looping full-bleed video keeps decoding + uploading a texture every frame
  // for as long as it plays, even once the hero has scrolled away — on mobile
  // that is a permanent tax on every other section's scrolling. Pause it once
  // it leaves the viewport and resume on the way back. Nothing visible changes:
  // the only frames we skip are frames nobody can see.
  //
  // The video also waits for the Preloader: it holds on its first frame while
  // the word intro plays and starts as the curtain lifts (PLAY_AFTER_INTRO_MS)
  // — so the opening of the clip isn't spent hidden behind the intro, even
  // when the file is already cached. "First frame" is heroVideoStart, not 0: the
  // clip opens with a fade from black, and the poster is taken from that point
  // so poster → paused frame → playback never dips to black.
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const root = document.documentElement
    let started = "preloaderDone" in root.dataset || root.classList.contains("cl-preview")
    let visible = true
    let hold: number | undefined

    const toStart = () => {
      if (el.paused) el.currentTime = SITE_MEDIA.heroVideoStart
    }
    if (el.readyState >= 1) toStart()
    else el.addEventListener("loadedmetadata", toStart, { once: true })

    const play = () => {
      el.currentTime = SITE_MEDIA.heroVideoStart
      if (visible) void el.play().catch(() => {})
    }
    const start = () => {
      if (started) return
      started = true
      hold = window.setTimeout(play, PLAY_AFTER_INTRO_MS)
    }
    window.addEventListener("eclemelin:preloader-done", start)
    const fallback = window.setTimeout(start, 4500) // ≈ Preloader dismissal

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        if (visible && started) void el.play().catch(() => {})
        else el.pause()
      },
      { rootMargin: "100px 0px" },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      el.removeEventListener("loadedmetadata", toStart)
      window.removeEventListener("eclemelin:preloader-done", start)
      window.clearTimeout(fallback)
      window.clearTimeout(hold)
    }
  }, [])

  return (
    <section
      data-header-theme="dark"
      className="relative h-[100svh] w-full overflow-hidden bg-ink"
    >
      {/* Looping background video — no controls, no interaction */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="auto"
        poster={imgSrc(SITE_MEDIA.heroVideoPoster, SITE_MEDIA.heroVideoVersion)}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={imgSrc(SITE_MEDIA.heroVideo, SITE_MEDIA.heroVideoVersion)} type="video/mp4" />
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
