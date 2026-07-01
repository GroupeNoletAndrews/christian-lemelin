"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { LenisProvider } from "@/components/providers/LenisProvider"
import { Preloader } from "@/components/ui/Preloader"
import { CustomScrollbar } from "@/components/ui/CustomScrollbar"
import { ContactFab } from "@/components/ui/ContactFab"

/**
 * Renders the public site chrome (nav, footer, preloader, smooth scroll,
 * custom scrollbar) around the page. The admin section (/admin*) is rendered
 * bare — no site nav — so it has its own minimal layout with a "back to site"
 * link instead.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")
  const isHome = pathname === "/"
  const isContact = pathname === "/contact"
  // La page de maintenance est autonome (cf. proxy.ts) — rendue sans chrome.
  const isMaintenance = pathname === "/maintenance"

  if (isAdmin || isMaintenance) {
    return <>{children}</>
  }

  return (
    <LenisProvider>
      {/* The accent is neutral black site-wide now (globals.css "No blue"),
          so no per-page marker is needed. */}
      <Preloader />
      <CustomScrollbar />
      <Header />
      <main>{children}</main>
      <Footer />
      {/* The full ContactCTA section lives on the home page; everywhere else a
          small floating "Nous joindre" pop-out points to the contact form
          (skipped on /contact itself). */}
      {!isHome && !isContact && <ContactFab />}
    </LenisProvider>
  )
}
