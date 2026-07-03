# ECLemelin — Plan de continuation (handoff)

> Site : Next.js 16 (Turbopack, App Router) + Supabase (Postgres via Prisma + Storage) + Tailwind v4, déployé sur Vercel. Branche : `feat/home-ui`. Dev : `npm run dev` (frontend/, port 3000). DB locale Supabase sur `127.0.0.1:54322`. Migrations : `npx prisma migrate deploy` puis `npx prisma generate` (⚠️ arrêter le dev server avant `generate` sur Windows — verrou DLL). Décisions design : accent **noir/blanc partout** (pas de bleu), système OPUS (voir `frontend/DESIGN.md`, encore en conflit de merge à résoudre).

## ✅ Déjà livré (cette série de sessions)
- **Conflits de merge résolus** : `proxy.ts` (maintenance + garde admin Supabase), pages solutions/installations, `Materiaux.tsx`.
- **Accent noir/blanc global** (globals.css « No blue ») + **fix marquee** (keyframes Tailwind v4 dans `@theme`, utilities explicites pour garder `--duration`/`--gap` par instance).
- **Refonte admin « Contenu du site »** (`src/app/admin/dashboard/content/page.tsx`) = hub unique :
  - Menu par **Pages** (Accueil → Savoir-faire, Réalisations, Matériaux ; À propos ; Installations ; Solutions ; Connexion admin) + **Collections** (Réalisations, Emplois). Réalisations apparaît sous **Accueil ET Collections** (prop `context: "home" | "collection"` → aperçu + grille spécifiques).
  - **Dashboard réduit aux métriques** ; **Emplois** migrés dans le workspace (`JobsEditor`, CRUD + Yup possible à ajouter) ; **jauge d'espace S3** (`StorageMeter` + `GET /api/admin/storage-usage`).
  - **Éditeur d'image non destructif** : recadrage point focal + zoom, N&B, coins/bordure, gaté par section (`SlotCaps`), via `ReframeModal` (grille règle-des-tiers + marqueur focal + puces de ratios) + **glisser-déposer** pour remplacer. Ombres admin retirées.
- **Système de layouts** (admin-sélectionnable, **staged → aperçu → effectif à la publication seulement**) :
  - Réalisations : 4 grilles (`masonry`, `uniform`, `editorial`, `carousel` — le carousel = boutons au survol + autoplay 2s + swipe mobile) via `RealisationsGrid`.
  - À-propos : 4 dispositions (`bento`, `uniform`, `editorial`, `gallery`) via `APropos.tsx`.
  - Persistance : table **`SiteSetting`** (clé/valeur) + `lib/server/site-settings.ts` + `POST/GET /api/admin/settings` + `lib/layouts.ts`. Aperçu staged via query `?layout=`/`?rlayout=` lue par les pages publiques en mode `?preview=1`.
- **Réalisations** : appartenance indépendante **`pinned`** (accueil, max 6) + **`inCollection`** (page /realisations) ; toggles dans le workspace + le formulaire d'édition.
- **Login `/admin` refait** : split image gauche / formulaire droite, image éditable (`admin-login` section), **afficher/masquer mot de passe**, **validation Yup** (pas de validation navigateur), **désactivé dans l'aperçu**.
- **Fixes** : logo responsive mobile, scroll reset à la navigation (Lenis), suppression du « set as header » public, **preloader qui ne flashe/gèle plus dans l'aperçu admin** (`html.cl-preview` posé pré-paint dans `layout.tsx` + CSS `globals.css` + dismiss instantané + Lenis toujours redémarré dans `Preloader.tsx`).
- **Sécurité** : pas de SQL brut (Prisma paramétré), pas de `dangerouslySetInnerHTML` (React échappe), zod côté serveur + `requireAdmin()`. SQLi/XSS couverts.
- **Cache d'images cloud (ex-tâche 1)** — livré 2026-07-01 :
  - **Optimiseur Next réactivé en prod** : `unoptimized` n'est plus codé en dur — décision par-src via `isUnoptimizedSrc()` (`lib/media.ts`) = data:/blob: + hôte local seulement. Corrigé dans `SlotImage`, `SlotParallaxImage`, `RealisationCard` (logos SVG Header/Footer restent `unoptimized`, l'optimiseur ne traite pas les SVG).
  - `next.config.ts` : `minimumCacheTTL` 1 an (sûr : les URLs éditables sont versionnées `?v=updatedAt` via `imgSrc`, le remplacement change l'URL).
  - `cacheControl: 31536000` sur les uploads images (`lib/uploads.ts`, `scripts/sync-site-media.ts`) → Supabase sert un `Cache-Control` long. Les CVs (bucket privé) gardent le défaut.
  - `preconnect`/`dns-prefetch` vers l'origine Supabase dans `layout.tsx` (hoistés par React dans `<head>`).
  - **Service worker drop-in** : `public/image-cache-sw.js` + `src/lib/image-cache/` (register + `<ImageCache/>` monté dans le layout, prod uniquement, jamais admin/preview ; README de réutilisation). Cache-first pour URLs versionnées (`?v=`), stale-while-revalidate pour le reste (logos statiques), images seulement (`destination === "image"`, jamais les vidéos — range requests), borné à 300 entrées FIFO, cache `cl-images-v1`.
  - **Fix découvert en route** : `imgSrc()` ne versionne plus les chemins locaux `/…` — l'optimiseur Next 16 renvoie 400 sur une URL locale avec query string (sauf `images.localPatterns`), ce qui cassait les réalisations seed (`/assets/…?v=…`).
  - Vérifié : `next build` OK + `next start` sous Playwright — SW activé/contrôlant, 0 erreur console, `/_next/image` en 200, 2ᵉ visite servie `deliveryType: cache`, et **hors ligne les images cachées se chargent depuis le SW** (témoin non caché échoue).

### Architecture à réutiliser (points d'entrée)
- Images éditables : `src/lib/sections-registry.ts` (SlotDef + `caps`), `src/lib/server/sections.ts` (`resolveSectionImages`/`resolveSectionStyles`/`publishSectionImages`), `SlotImage.tsx`/`SlotParallaxImage.tsx`, `SectionStyle.tsx` (contexte styles publiés), `section-preview.ts` (overrides live via postMessage), `section-style.ts` (types + CSS).
- Réglages : `src/lib/layouts.ts`, `src/lib/server/site-settings.ts`, `src/app/api/admin/settings/route.ts`.
- Réalisations : `Realisations.tsx` (accueil), `RealisationsGallery.tsx` (/realisations), `RealisationsGrid.tsx` (4 grilles), `RealisationCard.tsx`.
- Client API : `src/lib/api.ts`. Contexte admin : `src/lib/admin-context.tsx`.

---

## 🔜 Backlog restant (ordre conseillé)

### 1) ~~Cache d'images cloud~~ ✅ livré — voir « Déjà livré » ci-dessus

### 2) ~~Page de confidentialité + liens~~ ✅ livré 2026-07-01
`src/app/confidentialite/page.tsx` (server component, Loi 25 : données/finalités/hébergement/témoins/conservation/droits/CAI, coordonnées de `content/site.ts`). Liens posés : footer (bas de page), intro `/emplois`, sous les boutons d'envoi des formulaires contact + candidature, et dans la bannière. **Heures d'ouverture** ajoutées au footer (4ᵉ colonne discrète, source `HOURS` dans `content/site.ts`). *(Pas de page « conditions d'utilisation » — non prévue au backlog ; à ajouter sur demande.)*

### 3) ~~Bannière de consentement cookies~~ ✅ livré 2026-07-01
`ConsentBanner.tsx` + `lib/consent.ts` (cookie `cl_consent` JSON 1 an, événements `cl:manage-cookies`/`cl:consent-changed`), montée dans `SiteChrome` (jamais admin/maintenance/aperçu). Boutons Tout accepter / Refuser le non-essentiel / Personnaliser (Nécessaires verrouillé + Analytiques + Marketing). « Gérer les cookies » au footer rouvre prérempli. **Vercel Web Analytics** (`<Analytics/>` dans `layout.tsx`, sans témoin). Aucun script marketing/analytique tiers à gater pour l'instant — brancher sur `readConsent()`/`CONSENT_CHANGE_EVENT` le jour venu. (Point 5 facultatif — `cl_returning` pour sauter le preloader — non fait.)

### 3bis) ✅ Validation Yup partout (demande 2026-07-01)
Tous les formulaires sont `noValidate` (aucune validation navigateur) avec schémas Yup + erreurs par champ (pattern AdminLogin) centralisés dans **`src/lib/forms.ts`** (`yupErrors()`, `contactSchema`, `applySchema`, `jobSchema`, `passwordSchema`) : contact, candidature (ApplyModal), changement de mot de passe, éditeur d'emploi (page dédiée + JobsEditor du workspace). L'`alert()` de l'éditeur d'emploi remplacé par le Toast maison.

### 4) SEO (« top ranking »)
1. `metadataBase` + OG/Twitter par défaut dans `layout.tsx` (le `title.template` existe déjà). Vérifier titres/descriptions par page.
2. **JSON-LD** : `Organization`/`LocalBusiness` (nom, adresse Québec, geo, services, logo, `sameAs` réseaux) global ; **`JobPosting`** par emploi sur /emplois (éligible Google Jobs) ; `BreadcrumbList`.
3. `src/app/sitemap.ts` (pages statiques + éventuellement réalisations) et `src/app/robots.ts`.
4. Canonicals, `lang="fr-CA"`, un seul `<h1>` par page, `alt` sur images (les slots ont déjà `alt`).
5. Core Web Vitals : le **cache d'images** est livré (✅ tâche 1) ; polices déjà `display: swap`.
6. Mesure via Vercel Analytics. Externe : Google Business Profile + cohérence NAP (hors code).

---

## ⚠️ Caveats / à savoir pour la prochaine session
- **Impossible de tester l'intérieur de l'admin sans identifiants** — le rendu public est vérifiable via `?preview=1&layout=…`/`?rlayout=…` et via injection SQL dans `site_settings`/`section_images`. Vérifier manuellement (connecté) : pickers de layout (stage→publish), toggles pin/collection, `ReframeModal`, `JobsEditor`.
- **`frontend/DESIGN.md` est encore en conflit de merge** — à résoudre + documenter le « no blue » global, le système de recadrage/style et les layouts.
- Migrations Prisma déjà appliquées en local : `..._add_section_image_transform`, `..._realisation_collection_and_settings`. En prod, `prisma migrate deploy` tourne au build Vercel.
- Après un changement de schéma : arrêter le dev (port 3000), `prisma generate`, relancer `npm run dev` (verrou DLL Windows sinon).
- Mémoire projet : voir `~/.claude/.../memory/eclemelin-admin-backlog.md`.
