import type { Metadata } from "next"
import { MapPin, Phone, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr"
import { CONTACT } from "@/content"
import { ContactForm } from "@/components/sections/ContactForm"

export const metadata: Metadata = {
  title: "Nous joindre",
  description:
    "Communiquez avec Entreprises Christian Lemelin — 680, rue du Carbone, Québec. Parlons de votre projet de fabrication métallique sur mesure.",
}

export default function ContactPage() {
  return (
    <div data-header-theme="light" className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pb-12 pt-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <h1 className="max-w-[16ch] font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.0] tracking-[-0.02em] text-foreground">
            Communiquez avec nous.
          </h1>
          <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-foreground-muted">
            Grâce à notre expertise en fabrication sur mesure, nous accompagnons nos clients et
            partenaires dans la conception de solutions innovantes et durables. Un simple message
            suffit pour démarrer la conversation.
          </p>
        </div>
      </section>

      {/* Coordonnées + formulaire */}
      <section className="pb-28 md:pb-40">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 md:px-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <div className="space-y-8 border-t border-border pt-10">
              <div className="flex items-start gap-4">
                <MapPin size={20} weight="regular" className="mt-1 shrink-0 text-foreground-muted" />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                    Atelier
                  </p>
                  <p className="mt-2 text-lg text-foreground">{CONTACT.addressLine}</p>
                  <p className="text-lg text-foreground">{CONTACT.addressCity}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone size={20} weight="regular" className="mt-1 shrink-0 text-foreground-muted" />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                    Téléphone
                  </p>
                  <a
                    href={`tel:${CONTACT.phoneHref}`}
                    className="mt-2 block text-lg text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                  >
                    {CONTACT.phoneDisplay}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <EnvelopeSimple
                  size={20}
                  weight="regular"
                  className="mt-1 shrink-0 text-foreground-muted"
                />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                    Courriel
                  </p>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="mt-2 block text-lg text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                  >
                    {CONTACT.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </div>
  )
}
