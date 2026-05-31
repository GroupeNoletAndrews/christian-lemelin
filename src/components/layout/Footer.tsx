import Link from "next/link"
import { MapPin, Phone, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr"

const services = [
  { href: "/solutions", label: "Nos Solutions" },
  { href: "/fabrication", label: "Fabrication sur mesure" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/installations", label: "Nos Installations" },
]

const company = [
  { href: "/a-propos", label: "À Propos" },
  { href: "/emplois", label: "Emplois" },
  { href: "/contact", label: "Nous Joindre" },
]

export function Footer() {
  return (
    <footer className="bg-surface border-t border-black/8 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-10">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <p className="font-display text-[26px] text-zinc-900 tracking-[0.18em] uppercase leading-none mb-2">
              ECL
            </p>
            <p className="text-[10px] text-zinc-400 tracking-[0.15em] uppercase font-sans mb-6">
              Entreprises Christian Lemelin
            </p>
            <p className="text-sm text-zinc-500 font-sans leading-relaxed max-w-[340px]">
              Fabrication métallique sur mesure à Québec — inox, acier, aluminium, laiton et cuivre pour l&apos;industrie, la restauration et l&apos;architecture depuis des décennies.
            </p>
          </div>

          {/* Services */}
          <div>
            <p className="text-[10px] tracking-[0.15em] uppercase text-zinc-400 font-sans mb-5">
              Services
            </p>
            <ul className="space-y-3">
              {services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 font-sans hover:text-zinc-900 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] tracking-[0.15em] uppercase text-zinc-400 font-sans mb-5">
              Contact
            </p>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5 text-sm text-zinc-500 font-sans">
                <MapPin
                  size={14}
                  weight="regular"
                  className="mt-0.5 shrink-0 text-zinc-400"
                />
                Québec, QC, Canada
              </li>
              <li>
                <a
                  href="tel:+14186821750"
                  className="flex items-center gap-2.5 text-sm text-zinc-500 font-sans hover:text-zinc-900 transition-colors duration-150"
                >
                  <Phone size={14} weight="regular" className="shrink-0 text-zinc-400" />
                  418 682-1750
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@eclemelin.com"
                  className="flex items-center gap-2.5 text-sm text-zinc-500 font-sans hover:text-zinc-900 transition-colors duration-150"
                >
                  <EnvelopeSimple size={14} weight="regular" className="shrink-0 text-zinc-400" />
                  info@eclemelin.com
                </a>
              </li>
            </ul>

            <div className="mt-8">
              <p className="text-[10px] tracking-[0.15em] uppercase text-zinc-400 font-sans mb-5">
                Entreprise
              </p>
              <ul className="space-y-3">
                {company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 font-sans hover:text-zinc-900 transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-black/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-400 font-sans">
            © {new Date().getFullYear()} Entreprises Christian Lemelin Inc. Tous droits réservés.
          </p>
          <p className="text-[11px] text-zinc-400 font-sans tracking-[0.08em]">
            Québec · Canada
          </p>
        </div>
      </div>
    </footer>
  )
}
