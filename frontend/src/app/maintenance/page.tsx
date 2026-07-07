import type { Metadata } from "next"
import { CONTACT, COMPANY } from "@/content/site"
import { getLocale } from "@/lib/server/locale"
import { t } from "@/lib/i18n"

// Page de maintenance — affichée par le proxy quand MAINTENANCE_MODE=true
// (voir proxy.ts et README « Mode maintenance »). Rendue **sans chrome**
// (SiteChrome la traite comme /admin) → markup autonome, style OPUS.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: t("Site en maintenance", "Site under maintenance", locale),
    robots: { index: false, follow: false },
  }
}

export default async function MaintenancePage() {
  const locale = await getLocale()
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 text-foreground">
      <div className="w-full max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-foreground-muted">
          {COMPANY.shortName}
        </p>

        <h1 className="mt-8 text-balance text-4xl font-medium leading-[1.05] sm:text-5xl">
          {t("Le site est en maintenance", "The site is under maintenance", locale)}
        </h1>

        <p className="mt-6 text-balance leading-relaxed text-foreground-muted">
          {t(
            "Nous effectuons quelques améliorations. Le site sera de retour très bientôt. Merci de votre patience.",
            "We're making a few improvements. The site will be back very soon. Thank you for your patience.",
            locale,
          )}
        </p>

        <div className="mx-auto mt-12 h-px w-16 bg-border" />

        <div className="mt-12 space-y-2 text-sm text-foreground-muted">
          <p className="font-mono text-xs uppercase tracking-[0.18em]">
            {t("Besoin de nous joindre ?", "Need to reach us?", locale)}
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
