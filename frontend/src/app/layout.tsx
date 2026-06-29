import type { Metadata } from "next"
import { Onest, Fragment_Mono } from "next/font/google"
import "./globals.css"
import { SiteChrome } from "@/components/layout/SiteChrome"
import { RootLayoutWrapper } from "@/components/layout/RootLayoutWrapper"
import { ConsoleSignature } from "@/components/ui/ConsoleSignature"

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      className={`${onest.variable} ${fragmentMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* AdminProvider (admin/jobs context) wraps the OPUS layout so admin
            pages and /emplois keep working — see RootLayoutWrapper. */}
        <ConsoleSignature />
        <RootLayoutWrapper>
          <SiteChrome>{children}</SiteChrome>
        </RootLayoutWrapper>
      </body>
    </html>
  )
}
