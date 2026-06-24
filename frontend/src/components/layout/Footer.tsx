import Link from "next/link"
import {
  LinkedinLogoIcon,
  InstagramLogoIcon,
  FacebookLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react/dist/ssr"
import { CONTACT, COMPANY, MATERIALS, SOLUTION_DETAILS } from "@/content"

// Footer aligné sur la brochure PDF : bandeau « Durabilité & innovation », bloc
// contact (coordonnées de site.ts), puis colonnes ENTREPRISE / EXPERTISES
// MÉTAUX / SOLUTIONS / MÉDIAS / NOS EMPLOIS — liens dérivés du contenu pour ne
// jamais diverger des routes. Voir DESIGN.md.

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Entreprise",
    links: [
      { label: "À propos de nous", href: "/a-propos" },
      { label: "Installations & capacité", href: "/installations" },
      { label: "Fabrication sur mesure", href: "/fabrication" },
      { label: "Devenir client", href: "/contact" },
      { label: "Nous contacter", href: "/contact" },
    ],
  },
  {
    title: "Expertises métaux",
    links: MATERIALS.map((m) => ({ label: m.name, href: `/materiaux/${m.slug}` })),
  },
  {
    title: "Solutions",
    links: SOLUTION_DETAILS.map((s) => ({ label: s.title, href: `/solutions/${s.slug}` })),
  },
  { title: "Médias", links: [{ label: "Nos réalisations", href: "/realisations" }] },
  { title: "Nos emplois", links: [{ label: "Emplois disponibles", href: "/emplois" }] },
]

const contactCells = [
  { label: "Atelier", lines: [CONTACT.addressLine, CONTACT.addressCity] },
  { label: "Courriel", href: `mailto:${CONTACT.email}`, value: CONTACT.email },
  { label: "Téléphone", href: `tel:${CONTACT.phoneHref}`, value: CONTACT.phoneDisplay },
]

const socials = [
  { Icon: LinkedinLogoIcon, label: "LinkedIn" },
  { Icon: InstagramLogoIcon, label: "Instagram" },
  { Icon: FacebookLogoIcon, label: "Facebook" },
  { Icon: YoutubeLogoIcon, label: "YouTube" },
]

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="mx-auto max-w-[1400px] px-6 pb-10 pt-20 md:px-12 md:pt-28">
        {/* Bandeau */}
        <div>
          <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.01em] text-white">
            Durabilité &amp; innovation
          </h2>
          <p className="font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.01em] text-white/45">
            E.C. Lemelin, synonyme de qualité.
          </p>
        </div>

        {/* Bloc contact */}
        <div className="mt-12 grid overflow-hidden rounded-2xl border border-white/12 md:grid-cols-3">
          {contactCells.map((c) => (
            <div
              key={c.label}
              className="border-t border-white/12 p-6 first:border-t-0 md:border-l md:border-t-0 md:first:border-l-0"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                {c.label}
              </p>
              {c.lines
                ? c.lines.map((line) => (
                    <p key={line} className="mt-2 text-white/85 first:mt-2 [&:not(:first-child)]:mt-0">
                      {line}
                    </p>
                  ))
                : (
                    <a
                      href={c.href}
                      className="mt-2 inline-block text-white/85 underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
                    >
                      {c.value}
                    </a>
                  )}
            </div>
          ))}
        </div>

        {/* Colonnes de liens */}
        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3 lg:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                {col.title}
              </p>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bas de page */}
        <div className="mt-16 flex flex-col gap-6 border-t border-white/12 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-white/45">
            © {new Date().getFullYear()} {COMPANY.legalName} Tous droits réservés. · Québec · Canada
          </p>
          <div className="flex items-center gap-3">
            {socials.map(({ Icon, label }) => (
              // TODO: remplacer href="#" par les vraies URLs des réseaux sociaux
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid size-9 place-items-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-white/40 hover:text-white"
              >
                <Icon size={16} weight="fill" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
