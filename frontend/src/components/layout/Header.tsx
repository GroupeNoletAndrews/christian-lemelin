"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, type Variants } from "motion/react"
import { useLenis } from "@/components/providers/LenisProvider"
import { CONTACT } from "@/content"
import { mediaUrl, SITE_MEDIA } from "@/lib/media"
import { useLocale } from "@/components/providers/LocaleProvider"
import { tr, t, type Localized } from "@/lib/i18n"
import { LanguageToggle } from "@/components/ui/LanguageToggle"

type HeaderTheme = "dark" | "light"

const HEADER_MID_Y = 56

// Mobile browser-chrome tint per section theme (iOS Safari top/bottom bars).
// Matches the design tokens: ink #111111 (dark sections) / cream #f3f3f1 (light).
const CHROME_COLOR: Record<HeaderTheme, string> = {
  dark: "#111111",
  light: "#f3f3f1",
}

const navLinks: { href: string; label: Localized }[] = [
  { href: "/", label: { fr: "Accueil", en: "Home" } },
  { href: "/solutions", label: { fr: "Solutions", en: "Solutions" } },
  { href: "/fabrication", label: { fr: "Fabrication", en: "Fabrication" } },
  { href: "/realisations", label: { fr: "Réalisations", en: "Projects" } },
  { href: "/a-propos", label: { fr: "À Propos", en: "About" } },
  { href: "/emplois", label: { fr: "Emplois", en: "Careers" } },
]

// Placeholder partners (à remplacer par les vrais logos)


// Menu overlay animations — the frame/divider lines DRAW first (staggered),
// then the content reveals. Everything reverses on close.
const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

const overlayV: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.4, ease: EASE, delay: 0.55 } },
}

// Horizontal line draws left→right (scaleX)
const hLineV: Variants = {
  initial: { scaleX: 0 },
  animate: (i: number) => ({ scaleX: 1, transition: { duration: 0.7, ease: EASE, delay: 0.1 + i * 0.12 } }),
  exit: (i: number) => ({ scaleX: 0, transition: { duration: 0.4, ease: EASE, delay: i * 0.05 } }),
}

// Vertical line draws top→bottom (scaleY)
const vLineV: Variants = {
  initial: { scaleY: 0 },
  animate: (i: number) => ({ scaleY: 1, transition: { duration: 0.7, ease: EASE, delay: 0.1 + i * 0.12 } }),
  exit: (i: number) => ({ scaleY: 0, transition: { duration: 0.4, ease: EASE, delay: i * 0.05 } }),
}

// Content fades/rises in after the frame is drawn
const contentV: Variants = {
  initial: { opacity: 0, y: 22 },
  animate: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.6 + i * 0.07 } }),
  exit: { opacity: 0, transition: { duration: 0.25, ease: EASE } },
}

// Big nav links rise from a mask (left column), staggered
const linkRiseV: Variants = {
  initial: { y: "115%" },
  animate: (i: number) => ({ y: "0%", transition: { duration: 0.8, ease: EASE, delay: 0.55 + i * 0.08 } }),
  exit: (i: number) => ({ y: "115%", transition: { duration: 0.45, ease: EASE, delay: i * 0.05 } }),
}

export function Header() {
  const pathname = usePathname()
  const locale = useLocale()
  const lenis = useLenis()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<HeaderTheme>("light")
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  // Scroll listener, rAF-coalesced. It reads geometry (`getBoundingClientRect`
  // on every themed section) and pushes React state, and a touch scroll fires
  // far more `scroll` events than there are frames — so running it raw meant
  // several forced layouts and several renders per painted frame. Batching to
  // one run per frame keeps the behaviour identical and does the work once.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      setScrolled(y > 24)

      // Hide on scroll down, reveal on scroll up (small dead-zone to avoid jitter)
      const delta = y - lastY.current
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 120)
        lastY.current = y
      }

      const sections = document.querySelectorAll<HTMLElement>("[data-header-theme]")
      let detected: HeaderTheme = "light"
      sections.forEach((el) => {
        const { top, bottom } = el.getBoundingClientRect()
        if (HEADER_MID_Y >= top && HEADER_MID_Y < bottom) {
          detected = (el.dataset.headerTheme as HeaderTheme) ?? "light"
        }
      })
      setTheme(detected)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule, { passive: true })
    update()
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [])

  // Tint the mobile browser chrome (iOS Safari top/bottom bars) to match the
  // dark/light section currently under the header. The <meta name="theme-color">
  // is seeded by the root layout's viewport export; we mutate it at runtime.
  useEffect(() => {
    // The open menu overlay is a full-screen dark panel → dark chrome too.
    const color = open ? CHROME_COLOR.dark : CHROME_COLOR[theme]
    // `theme-color` tints the TOP bar; iOS Safari tints the BOTTOM toolbar +
    // safe-area + overscroll from the ROOT background colour (the <body> bg is
    // hard-coded cream in globals.css) — so we must sync both, or the bottom
    // bar stays white over dark sections.
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color)
    document.documentElement.style.backgroundColor = color
    document.body.style.backgroundColor = color
  }, [theme, open])

  // Restore the stylesheet defaults if the Header unmounts (e.g. /admin, which
  // renders without site chrome) so the inline overrides don't leak.
  useEffect(
    () => () => {
      document.documentElement.style.backgroundColor = ""
      document.body.style.backgroundColor = ""
    },
    [],
  )

  // Close on navigation
  useEffect(() => setOpen(false), [pathname])

  // Lock scroll while the menu overlay is open (Lenis + native fallback)
  useEffect(() => {
    if (open) {
      lenis?.stop()
      document.body.style.overflow = "hidden"
    } else {
      lenis?.start()
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open, lenis])

  // In the closed bar, the white logo crossfades in over dark sections.
  const darkBar = theme === "dark" && !open
  const logoWhite = open || theme === "dark"

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[96]"
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      >
        <div
          className={`flex h-16 items-center justify-between px-4 transition-colors duration-300 md:h-20 md:px-12 ${
            scrolled && !open
              ? darkBar
                ? "bg-black/30 backdrop-blur-xl"
                : "bg-background/70 backdrop-blur-xl"
              : "border-transparent"
          }`}
        >
          {/* Logo — two baked-colour SVGs crossfading (black over light, white
              over dark / open menu); no CSS invert. */}
          <Link href="/" className="relative z-50 flex shrink-0 items-center">
            <span className="relative inline-flex h-7 items-center sm:h-11 md:h-14">
              <Image
                src={mediaUrl(SITE_MEDIA.logoNoir)}
                alt="Entreprises Christian Lemelin"
                width={1500}
                height={240}
                priority
                unoptimized
                className={`h-7 w-auto transition-opacity duration-300 sm:h-11 md:h-14 ${logoWhite ? "opacity-0" : "opacity-100"}`}
              />
              <Image
                src={mediaUrl(SITE_MEDIA.logoBlanc)}
                alt=""
                aria-hidden
                width={1500}
                height={240}
                priority
                unoptimized
                className={`absolute inset-0 h-7 w-auto transition-opacity duration-300 sm:h-11 md:h-14 ${logoWhite ? "opacity-100" : "opacity-0"}`}
              />
            </span>
          </Link>

          {/* Contrôles à droite : petite bascule FR/EN (masquée quand le menu est
              ouvert — l'overlay a la sienne) + bouton Menu/Fermer. */}
          <div className="relative z-50 flex items-center gap-2 md:gap-3">
            {!open && <LanguageToggle variant="pill" tone={darkBar ? "dark" : "light"} />}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? t("Fermer le menu", "Close menu", locale) : t("Ouvrir le menu", "Open menu", locale)}
              className={`inline-flex h-9 items-center rounded-full px-4 text-[13px] font-medium tracking-[0.02em] transition-colors duration-200 md:px-5 ${
                open
                  ? "bg-white text-foreground hover:bg-white/90"
                  : "bg-accent text-white hover:bg-accent-hover"
              }`}
            >
              {open ? t("Fermer", "Close", locale) : t("Menu", "Menu", locale)}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Full-screen OPUS-blue menu — framed layout, frame/divider lines draw in.
          Big nav links on the left, info on the right, partners at the bottom. */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={overlayV}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[95] bg-black text-white"
          >
            <div className="h-full w-full px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:px-8 md:pb-8">
              {/* Framed canvas — outer lines draw around everything */}
              <div className="relative h-full w-full">
                <motion.div variants={hLineV} custom={0} className="absolute left-0 top-0 h-px w-full origin-left bg-white/25" />
                <motion.div variants={hLineV} custom={1} className="absolute bottom-0 left-0 h-px w-full origin-right bg-white/25" />
                <motion.div variants={vLineV} custom={0} className="absolute left-0 top-0 h-full w-px origin-top bg-white/25" />
                <motion.div variants={vLineV} custom={1} className="absolute right-0 top-0 h-full w-px origin-bottom bg-white/25" />

                {/* Inner content */}
                <div data-lenis-prevent className="flex h-full flex-col overflow-y-auto px-5 py-6 md:overflow-visible md:px-10 md:py-8">
                  {/* Main: big links (left) | divider | info (right). The logo +
                      close toggle live in the floating header bar above; the whole
                      frame is pushed below it (wrapper pt-24) so no menu line
                      overlaps the logo. */}
                  <div className="flex flex-col md:flex-1 md:flex-row">
                    {/* Big nav links — left */}
                    <nav className="flex flex-col md:flex-1 md:justify-center md:pr-12">
                      {navLinks.map((link, i) => (
                        <div key={link.href} className="overflow-hidden">
                          <motion.div variants={linkRiseV} custom={i}>
                            <Link
                              href={link.href}
                              className="block py-0.5 font-display text-[clamp(2rem,5.5vw,4.25rem)] font-medium leading-[1.08] tracking-[-0.02em] text-white/90 transition-colors hover:text-white"
                            >
                              {tr(link.label, locale)}
                            </Link>
                          </motion.div>
                        </div>
                      ))}
                    </nav>

                    {/* Vertical divider */}
                    <motion.div variants={vLineV} custom={3} className="hidden w-px origin-top self-stretch bg-white/25 md:block" />

                    {/* Info — right */}
                    <div className="flex w-full flex-col pt-8 md:w-[32%] md:justify-center md:pl-12 md:pt-0">
                      <motion.div variants={contentV} custom={0}>
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">
                          Entreprises Christian Lemelin
                        </p>
                        <p className="mt-1 text-sm text-white/75">
                          {t("Fabrication métallique sur mesure — Québec", "Custom metal fabrication — Québec", locale)}
                        </p>
                      </motion.div>

                      <motion.div variants={contentV} custom={1} className="mt-6 flex flex-col gap-2 text-base md:mt-8 md:text-lg">
                        <a href={`tel:${CONTACT.phoneHref}`} className="w-fit text-white/85 transition-colors hover:text-white">
                          {CONTACT.phoneDisplay}
                        </a>
                        <a href={`mailto:${CONTACT.email}`} className="w-fit text-white/85 transition-colors hover:text-white">
                          {CONTACT.email}
                        </a>
                        <span className="text-white/60">{CONTACT.addressLine}, {CONTACT.addressCity}</span>
                      </motion.div>

                      <motion.div variants={contentV} custom={2}>
                        <Link
                          href="/contact"
                          className="mt-6 inline-flex h-12 w-fit items-center rounded-full bg-white px-7 text-[14px] font-medium text-foreground transition-colors hover:bg-white/90 md:mt-8"
                        >
                          {t("Nous joindre", "Contact us", locale)}
                        </Link>
                      </motion.div>

                      <motion.div variants={contentV} custom={3} className="mt-6 md:mt-8">
                        <LanguageToggle variant="inline" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Divider above partners */}
                  <motion.div variants={hLineV} custom={4} className="mb-6 mt-6 hidden h-px w-full origin-left bg-white/25 md:mb-8 md:mt-8 md:block" />

                  {/* Partners (placeholder — à remplacer par les vrais logos) */}
                  <motion.div variants={contentV} custom={4} className="hidden flex-wrap items-center gap-x-8 gap-y-4 md:flex md:justify-between">
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
