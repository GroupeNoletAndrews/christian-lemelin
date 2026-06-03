import type { Metadata } from "next"
import { Bebas_Neue, Barlow_Condensed, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { RootLayoutWrapper } from "@/components/layout/RootLayoutWrapper"

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
})

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
  weight: ["600"],
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
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
      className={`${bebasNeue.variable} ${barlowCondensed.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <RootLayoutWrapper>
          <Header />
          <main>{children}</main>
          <Footer />
        </RootLayoutWrapper>
      </body>
    </html>
  )
}
