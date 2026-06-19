"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { LenisProvider } from "@/components/providers/LenisProvider"
import { Preloader } from "@/components/ui/Preloader"
import { CustomScrollbar } from "@/components/ui/CustomScrollbar"

/**
 * Renders the public site chrome (nav, footer, preloader, smooth scroll,
 * custom scrollbar) around the page. The admin section (/admin*) is rendered
 * bare — no site nav — so it has its own minimal layout with a "back to site"
 * link instead.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <LenisProvider>
      <Preloader />
      <CustomScrollbar />
      <Header />
      <main>{children}</main>
      <Footer />
    </LenisProvider>
  )
}
