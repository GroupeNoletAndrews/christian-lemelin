import type { Metadata } from "next"
import { Onest, Fragment_Mono } from "next/font/google"
import "./globals.css"
import { SiteChrome } from "@/components/layout/SiteChrome"
import { RootLayoutWrapper } from "@/components/layout/RootLayoutWrapper"
import { Analytics } from "@vercel/analytics/react"
import { ConsoleSignature } from "@/components/ui/ConsoleSignature"
import { ImageCache } from "@/lib/image-cache/ImageCache"

// OPUS design system — see DESIGN.md
// Onest: variable font for headings + body. Fragment Mono: eyebrows, labels, section numbers.
const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
})

const fragmentMono = Fragment_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fragment-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Entreprises Christian Lemelin | Fabrication métallique sur mesure — Québec",
    template: "%s | ECLemelin",
  },
  description:
    "Fabrication métallique sur mesure à Québec. Inox, acier, aluminium, laiton et cuivre pour l'industrie, la restauration et l'architecture.",
  keywords: [
    "fabrication métallique",
    "acier inoxydable",
    "sur mesure",
    "Québec",
    "mobilier industriel",
    "inox",
    "aluminium",
  ],
  openGraph: {
    type: "website",
    locale: "fr_CA",
    siteName: "Entreprises Christian Lemelin",
  },
}

// Supabase Storage origin (photos + hero video). Pre-connecting from the HTML
// shaves the DNS+TLS handshake off the first media request.
function supabaseOrigin(): string | null {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin
  } catch {
    return null
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const mediaOrigin = supabaseOrigin()
  return (
    <html
      lang="fr"
      className={`${onest.variable} ${fragmentMono.variable}`}
      // The pre-paint script below may add `cl-preview` to <html> before React
      // hydrates — suppress the resulting attribute-mismatch warning.
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* React hoists these into <head>. Media loads as no-cors (<img>/<video>),
            so the un-attributed preconnect is the one the browser reuses. */}
        {mediaOrigin && (
          <>
            <link rel="preconnect" href={mediaOrigin} />
            <link rel="dns-prefetch" href={mediaOrigin} />
          </>
        )}
        {/* Pre-paint: mark the admin content-workspace preview iframe so the
            intro preloader is hidden before it can flash (see globals.css). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(new URLSearchParams(location.search).has('preview'))document.documentElement.classList.add('cl-preview')}catch(e){}",
          }}
        />
        {/* AdminProvider (admin/jobs context) wraps the OPUS layout so admin
            pages and /emplois keep working — see RootLayoutWrapper. */}
        <ConsoleSignature />
        <ImageCache />
        {/* Mesure d'audience SANS témoin (cookieless) — aucun consentement requis. */}
        <Analytics />

        <RootLayoutWrapper>
          <SiteChrome>{children}</SiteChrome>
        </RootLayoutWrapper>
      </body>
    </html>
  )
}
