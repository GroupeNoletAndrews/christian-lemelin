"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { List, X } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"

type HeaderTheme = "dark" | "light"

// Vertical midpoint of the floating header in viewport coords (top:24 + h:64/2 = 56)
const HEADER_MID_Y = 56

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/solutions", label: "Solutions" },
  { href: "/fabrication", label: "Fabrication" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/a-propos", label: "À Propos" },
  { href: "/emplois", label: "Emplois" },
]

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<HeaderTheme>("dark")

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 50)

      const sections = document.querySelectorAll<HTMLElement>("[data-header-theme]")
      let detected: HeaderTheme = "dark"
      sections.forEach((el) => {
        const { top, bottom } = el.getBoundingClientRect()
        if (HEADER_MID_Y >= top && HEADER_MID_Y < bottom) {
          detected = (el.dataset.headerTheme as HeaderTheme) ?? "dark"
        }
      })
      setTheme(detected)
    }

    window.addEventListener("scroll", update, { passive: true })
    update()
    return () => window.removeEventListener("scroll", update)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const light = theme === "light"

  // Glassmorphism container
  const containerStyle: React.CSSProperties = {
    borderRadius: "16px",
    background: light
      ? scrolled ? "rgb(255 255 255 / 0.92)" : "rgb(255 255 255 / 0.85)"
      : scrolled ? "rgb(255 255 255 / 0.11)" : "rgb(255 255 255 / 0.07)",
    border: light
      ? "1px solid rgb(0 0 0 / 0.08)"
      : "1px solid rgb(255 255 255 / 0.18)",
    backdropFilter: "blur(24px) saturate(180%) contrast(1.05)",
    WebkitBackdropFilter: "blur(24px) saturate(180%) contrast(1.05)",
    boxShadow: light
      ? "inset 0 1px 0 rgb(255 255 255 / 0.95), 0 4px 24px rgb(0 0 0 / 0.10), 0 1px 4px rgb(0 0 0 / 0.06)"
      : "inset 0 1px 0 rgb(255 255 255 / 0.20), 0 8px 32px rgb(0 0 0 / 0.40)",
    transition: "background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
  }

  // Text tokens
  const navActive = light ? "text-zinc-900" : "text-white"
  const navInactive = light ? "text-zinc-600 hover:text-zinc-900" : "text-white/60 hover:text-white"
  const toggleColor = light ? "text-zinc-500 hover:text-zinc-900" : "text-white/70 hover:text-white"
  const t = "transition-colors duration-[350ms]"

  return (
    <>
      <header className="fixed top-6 left-1/2 z-50 w-[calc(100%-48px)] max-w-[1200px] -translate-x-1/2">
        <div className="flex h-16 items-center justify-between px-5 md:px-6" style={containerStyle}>

          {/* Logo — invert in dark mode (transparent PNG: dark elements → white) */}
          <Link href="/" className="shrink-0 flex items-center">
            <Image
              src="/assets/logo_eclemelin.png"
              alt="Entreprises Christian Lemelin"
              width={384}
              height={64}
              priority
              className={`h-7 w-auto transition-[filter] duration-[350ms] ${light ? "" : "invert"}`}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 text-[13px] font-sans tracking-[0.02em] ${t} ${active ? navActive : navInactive}`}
                >
                  {link.label}
                  {active && <span className="block h-px w-full mt-0.5 bg-accent" />}
                </Link>
              )
            })}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/*
              Button radius = 8px = half of header's 16px → mathematically coherent
              Dark text on amber (#F5A020) for WCAG AA contrast (~8:1 ratio)
              Amber glow on hover (MOTION_INTENSITY: 7)
            */}
            <Link
              href="/contact"
              className="hidden md:flex items-center px-4 h-9 text-[13px] font-sans font-medium tracking-[0.03em] text-zinc-950 bg-accent rounded-lg hover:bg-accent-hover hover:shadow-[0_0_20px_rgb(245_160_32/0.40)] active:scale-[0.97] active:shadow-none transition-all duration-200"
            >
              Nous Joindre
            </Link>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={`lg:hidden flex items-center justify-center w-9 h-9 ${t} ${toggleColor}`}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileOpen
                ? <X size={18} weight="regular" />
                : <List size={18} weight="regular" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown — always dark */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed top-[104px] left-1/2 z-40 w-[calc(100%-48px)] max-w-[1200px] -translate-x-1/2"
            style={{
              background: "rgb(9 9 11 / 0.96)",
              border: "1px solid rgb(255 255 255 / 0.10)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <nav className="flex flex-col p-3 gap-0.5">
              {navLinks.map((link) => {
                const active = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3 text-sm font-sans tracking-[0.02em] transition-colors rounded-lg ${
                      active ? "text-white bg-white/5" : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <div className="h-px bg-white/8 my-2" />
              <Link
                href="/contact"
                className="px-4 py-3 text-sm font-sans font-medium text-zinc-950 bg-accent hover:bg-accent-hover rounded-lg text-center transition-colors"
              >
                Nous Joindre
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
