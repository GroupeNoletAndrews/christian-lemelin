import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/server/auth"
import { COOKIE_NAME } from "@/lib/server/cookies"

// Next 16 renamed `middleware.ts` -> `proxy.ts` (function `middleware` -> `proxy`).
//
// Two jobs:
//  1. **Mode maintenance** — quand la variable d'env `MAINTENANCE_MODE` vaut
//     `"true"` (réglée dans Vercel → Settings → Environment Variables, puis
//     redéploiement), tout le site public est réécrit vers `/maintenance`
//     (503). L'admin (`/admin`), l'API et les internes Next restent joignables
//     pour que tu puisses continuer à te connecter / travailler.
//  2. **Garde du dashboard admin** — redirige vers la page de connexion quand
//     le cookie de session est absent/invalide. La vraie autorisation reste
//     requireAdmin() dans chaque route /api.

// Lu au démarrage (les vars d'env sont figées par déploiement sur Vercel).
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true"

// Chemins toujours joignables même en maintenance.
function isMaintenanceBypassed(pathname: string): boolean {
  return (
    pathname === "/maintenance" ||
    pathname.startsWith("/admin") || // l'admin doit rester accessible
    pathname.startsWith("/api") ||
    pathname.startsWith("/monitoring") || // tunnel Sentry (next.config.ts)
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  )
}

export const config = {
  // Exécute le proxy sur toutes les routes sauf les assets statiques (le mode
  // maintenance doit pouvoir intercepter n'importe quelle page).
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) Mode maintenance : réécrit le site public vers /maintenance.
  if (MAINTENANCE_MODE && !isMaintenanceBypassed(pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = "/maintenance"
    return NextResponse.rewrite(url, {
      status: 503,
      headers: { "Retry-After": "3600" },
    })
  }

  // 2) Garde du dashboard admin.
  if (pathname.startsWith("/admin/dashboard")) {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (token) {
      try {
        await verifyToken(token)
        return NextResponse.next()
      } catch {
        /* invalide/expiré — on retombe sur la redirection */
      }
    }
    const url = req.nextUrl.clone()
    url.pathname = "/admin"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
