import type { Metadata } from "next"
import { CONTACT, COMPANY } from "@/content/site"

// Page de maintenance — affichée par le proxy quand MAINTENANCE_MODE=true
// (voir proxy.ts et README « Mode maintenance »). Rendue **sans chrome**
// (SiteChrome la traite comme /admin) → markup autonome, style OPUS.
export const metadata: Metadata = {
  title: "Site en maintenance",
  robots: { index: false, follow: false },
}

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 text-foreground">
      <div className="w-full max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-foreground-muted">
          {COMPANY.shortName}
        </p>

        <h1 className="mt-8 text-balance text-4xl font-medium leading-[1.05] sm:text-5xl">
          Le site est en maintenance
        </h1>

        <p className="mt-6 text-balance leading-relaxed text-foreground-muted">
          Nous effectuons quelques améliorations. Le site sera de retour très
          bientôt. Merci de votre patience.
        </p>

        <div className="mx-auto mt-12 h-px w-16 bg-border" />

        <div className="mt-12 space-y-2 text-sm text-foreground-muted">
          <p className="font-mono text-xs uppercase tracking-[0.18em]">
            Besoin de nous joindre&nbsp;?
          </p>
          <p>
            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="text-foreground underline underline-offset-4"
            >
              {CONTACT.phoneDisplay}
            </a>
          </p>
          <p>
            <a
              href={`mailto:${CONTACT.email}`}
              className="text-foreground underline underline-offset-4"
            >
              {CONTACT.email}
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
