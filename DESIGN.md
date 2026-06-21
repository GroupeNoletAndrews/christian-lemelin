# Système de design — Entreprises Christian Lemelin

> **Source de vérité du design.** À consulter **avant de créer ou modifier toute UI**, et à **mettre à jour à chaque changement de design** (voir [Journal](#journal-des-modifications) en bas).
>
> Référence visuelle : template Framer **OPUS** — https://opus-template.framer.website/

---

## 1. Principes

Le langage visuel est **simple, épuré et aéré**, calqué sur OPUS :

- **Espace avant tout** — du whitespace généreux entre sections et autour du contenu. Laisser respirer.
- **Retenue** — peu d'éléments par écran, une hiérarchie claire, pas de décor superflu.
- **Un seul accent fort** — le bleu électrique, utilisé avec parcimonie (liens, CTA, détails). Le reste est neutre.
- **Hairlines, pas de boîtes lourdes** — séparateurs fins (`border-border`) plutôt que cartes contrastées.
- **Mouvement sobre** — animations discrètes, jamais gratuites ; toujours respecter `prefers-reduced-motion`.

---

## 2. Couleurs

Tokens définis dans [`src/app/globals.css`](src/app/globals.css) (`@theme inline`). **Toujours utiliser les classes Tailwind ci-dessous — jamais de hex en dur dans les composants.**

| Token | Valeur | Usage | Classe Tailwind |
|---|---|---|---|
| `background` | `#f3f3f1` | Fond de page (crème) | `bg-background` |
| `surface` / `surface-elevated` | `#ffffff` | Cartes, panneaux élevés | `bg-surface` |
| `foreground` | `#141414` | Texte principal (noir **neutre**, pas de vert) | `text-foreground` |
| `foreground-muted` | `rgba(20,20,20,.6)` | Texte secondaire / légendes | `text-foreground-muted` |
| `ink` | `#111111` | Fond des sections sombres (neutre) | `bg-ink` (texte `text-white`) |
| `accent` | `#0048f9` | Accent bleu — **uniquement** flèche de lien et fond de bouton | `bg-accent` |
| `accent-hover` | `#0039c4` | Survol de l'accent (dérivé) | `bg-accent-hover` |
| `border` | `rgba(151,151,151,.2)` | Séparateurs fins (hairlines) | `border-border` |

⚠️ **Pas de texte bleu.** Le bleu ne sert que pour : la flèche `↗` des liens et le fond des boutons (texte blanc dessus). Jamais pour du texte (titres, chiffres, codes…). Pas de teinte verte nulle part — les noirs sont neutres.

> ⚠️ **Migration en cours :** certains composants utilisent encore `text-zinc-*`, `black/8`, `black/12`. À remplacer progressivement par les tokens ci-dessus.

---

## 3. Typographie

Chargées via `next/font/google` dans [`src/app/layout.tsx`](src/app/layout.tsx).

| Police | Rôle | Classe |
|---|---|---|
| **Onest** (variable) | Titres **et** corps de texte | `font-sans` / `font-display` (par défaut sur `body`) |
| **Fragment Mono** (400) | Labels, codes | `font-mono` |

**Conventions :**
- **Titres** : Onest, **casse normale** (pas de capitales), poids medium/semibold, grande taille, `leading` serré (`leading-[1.05]`). OPUS n'utilise pas de capitales condensées.
- **Labels** : Fragment Mono, petit, `uppercase`, `tracking` large (`tracking-[0.18em]`), en `text-foreground-muted`.
- **Corps** : Onest, poids normal, `leading-relaxed`, `text-foreground-muted` pour le secondaire.
- Tailles fluides via `clamp()` pour les grands titres.

> ⚠️ **Migration en cours :** les composants hérités utilisent `font-display` en `uppercase` (esthétique Bebas Neue). À convertir vers des titres Onest en casse normale lors des prochaines passes.

---

## 4. Espacement & layout

- **Padding de section** généreux : viser `py-24`/`py-32` desktop, `py-16`/`py-20` mobile.
- **Largeur de contenu** bornée (`max-w-*`) avec marges latérales confortables (`px-6` mobile, `px-14`+ desktop).
- Espacements verticaux à l'échelle Tailwind ; privilégier la respiration au remplissage.
- Grilles simples, alignées ; éviter la surcharge d'éléments.

---

## 5. Composants

**Primitives réutilisables** (dans [`src/components/ui/`](src/components/ui/)) — **à réutiliser, ne pas réinventer** :
- [`ArrowLink`](src/components/ui/ArrowLink.tsx) — lien bleu avec flèche `↗`.

> **Pas de pilules/badges.** Ni eyebrow (pill point bleu + label en tête de section), ni tag (pill outline de catégorie/matériau). Les sections s'ouvrent directement sur leur titre ; les métadonnées s'écrivent en texte simple.

- **Boutons / CTA** : pill `rounded-full`, fond `bg-accent`, **texte blanc** (jamais texte sombre sur le bleu), survol `bg-accent-hover`. Variante secondaire : bordure `border-border` + texte `text-foreground`.
- **Cartes / panneaux** : `bg-surface`, séparation par `border-border` (hairline) plutôt qu'ombres marquées.
- **Focus** : contour bleu `#0048f9` (défini globalement via `:focus-visible`). Ne pas le retirer.

---

## 6. Motion

- Smooth-scroll déjà en place (Lenis / GSAP ScrollTrigger).
- Animations d'entrée discrètes (fondu, léger translate).
- **Toujours** garder un fallback `prefers-reduced-motion` (déjà respecté dans `Materiaux.tsx`, `ModelViewer.tsx`).

---

## 7. Layout & patterns OPUS *(observés sur le template — à reproduire)*

Captures de référence prises au 1440px. Le layout d'OPUS repose sur ces patterns — **toute nouvelle section doit s'en inspirer.**

- **Navigation** : barre **minimale** transparente (logo à gauche + un seul bouton pill « Menu » bleu à droite), repliée sur **tous** les écrans comme OPUS. Au clic → **overlay plein écran bleu** (`bg-accent`) : liens en très grand **centrés** (Onest), barre contact + bouton « Nous joindre » blanc en bas. Le bouton bascule en « Fermer » (pill blanc, texte foncé). Sticky : fond `backdrop-blur` + hairline au scroll. **Auto-hide directionnel** : la barre **se cache (slide `translateY(-100%)`) au scroll vers le bas** (après ~120 px) et **réapparaît animée au scroll vers le haut** (`motion.header`, dead-zone de 6 px anti-jitter ; reste visible si le menu est ouvert).
  - **Animation d'ouverture/fermeture (façon pointlaz.com)** : révélation **graduelle ligne par ligne** — chaque lien **monte depuis un masque** (`overflow-hidden`) et un **trait se dessine** (`scaleX`) sous lui, en cascade (`custom={i}`, ~1,7 s). La **fermeture** rejoue l'inverse (liens redescendent dans le masque, traits se rétractent) puis l'overlay s'efface. Variants `overlayV`/`linkV`/`lineV`/`fadeV` dans [`Header.tsx`](src/components/layout/Header.tsx).
- **Liens** : texte **souligné** (couleur neutre `text-foreground` ou `text-white`), souligné fin `underline-offset`, + flèche **`↗` bleue**. Le texte n'est **jamais** bleu. Composant [`ArrowLink`](src/components/ui/ArrowLink.tsx).
- **Parallax images** : sur les cartes (Solutions, Réalisations, Matériaux), l'image est sur-dimensionnée (**170%**) et translate verticalement (`amount` ~19%) au scroll → effet marqué « les images me suivent ». Composant [`ParallaxImage`](src/components/ui/ParallaxImage.tsx), respecte `prefers-reduced-motion`, fluide via Lenis.
- **Hero** : **bannière vidéo plein cadre** (`videoLemelin.mp4`, autoplay/muette/loop, sans contrôles) façon pointlaz, en style OPUS. Contenu ancré en bas à gauche, texte blanc sur dégradé de lisibilité : titre **immense** « Les Entreprises / Christian Lemelin » (Onest) sur **deux lignes décalées** façon OPUS (1re ligne tirée vers la gauche `md:-ml-9` — déborde un peu du padding ; 2e ligne décalée à droite `md:ml-16` ; lignes **espacées** `leading-[1.02]` + `mt-2` ; `md:whitespace-nowrap` ; empile naturellement sur mobile). **Wrapper pleine largeur, ancré à gauche** (pas de `mx-auto`/`max-w`) : le titre colle au **bord gauche de la vidéo**. En dessous, une rangée `md:grid-cols-[1fr_auto] justify` — l'**intro est alignée sous « Christian Lemelin »** (`md:ml-16`, même indent que la 2e ligne) et le **lien `↗` est poussé au bord droit** de la vidéo. Le texte **apparaît après 3 s** (révélation en cascade). `data-header-theme="dark"`. Voir [`Hero.tsx`](src/components/sections/Hero.tsx).
- **Sections** : pas d'eyebrow ni de pilule — chaque section **s'ouvre directement sur son titre**.
- **Sections alternées** : blanc `#fff` / crème `#f3f3f1` / **noir neutre `#111111`** (token `ink`, texte blanc — **pas de teinte verte**). Très grand padding vertical (respiration).
- **Titres** : Onest, **casse normale**, taille géante (`clamp`), `leading` serré. Jamais tout en majuscules.
- **Stats** ([`StatsBar.tsx`](src/components/sections/StatsBar.tsx)) : très grands chiffres en **`text-foreground` neutre** (pas de bleu) + petit label gris, **centrés**. Section **fond crème (`bg-background`, sans bordure)** pour **fusionner avec le reste** (plus de bande blanche). Les chiffres sont **animés en compteur** (count-up de 0 → cible) au scroll dans la vue (`useInView` + `animate` sur un `useMotionValue`, formatage FR « 2 400 », suffixes `+`/`%` préservés, `tabular-nums`, fallback `prefers-reduced-motion`). Délimité par des **hairlines qui se dessinent** (`scaleX` 0→1, même easing `[0.76,0,0.24,1]` que le menu). En bas, un **marquee de partenaires** (placeholder) qui **défile de droite à gauche** en boucle continue (deux copies + `x:["0%","-50%"]` linéaire infini, bords fondus par `mask-image`, mono gris + puces).
- **Liste de services (Savoir-faire)** : **« Apple feature block »** reproduit de skiper-ui *Skiper76* — **bloc arrondi inséré** (`rounded-[2.5rem] overflow-hidden`, `min-h-[100svh]`) sur fond de page **crème** : la section externe garde une **fine marge** (`p-3 md:p-4`) pour laisser **voir le fond clair autour** des coins arrondis. `data-header-theme="dark"` sur la section externe (évite le scintillement du header sur la marge crème). **L'image englobe tout le bloc** (full-bleed `absolute inset-0`, `object-cover`, clippée par les coins arrondis) et fait un **crossfade façon Apple** au changement de service. Par-dessus, à gauche : le titre + des **pastilles-accordéon en verre dépoli** (`backdrop-blur`, `rounded-[1.6rem]`, icône `+` circulée ; la pastille **active** = verre sombre `bg-black/45` qui se **déplie** pour révéler description + lien `↗`). À droite, des **flèches haut/bas** (`CaretUp`/`CaretDown`, cercles en verre) **naviguent le carousel** de façon cyclique (centrées verticalement en desktop, en haut à droite sur mobile). Image **monochrome (`?grayscale`) fortement assombrie** (voiles `bg-black/45` + dégradés `from-black` à gauche/bas) → la section lit **noir minimaliste**, la photo n'est qu'un fond texturé subtil (placeholder ; remplacer par de vraies photos d'atelier monochromes). Empile sur mobile (contenu sur l'image). Voir [`SavoirFaire.tsx`](src/components/sections/SavoirFaire.tsx).
  - **Transition image (mesurée 1:1 sur le template via MCP Playwright)** : l'entrante surgit **de la droite** (`x:+8%`, `scale 0.92`, `opacity 0`) et **spring** vers l'état de repos (`scale 1.14` d'overscan, `x:0`) après un **décalage ~0,16 s** ; la sortante **glisse vers la gauche** (`x:-8%`, `scale 0.92`) et s'efface aussitôt → le « filmstrip » glisse vers la gauche, léger overshoot spring, très fluide. `AnimatePresence mode="sync"` + `motion/react`. Fallback `prefers-reduced-motion` = simple fondu.
- **Cartes process** (section sombre) : `rounded-2xl`, bordure subtile, titre ; la carte active est plus claire.
- **Grille projets** : **masonry asymétrique**, cartes = image `rounded-2xl` contenue + titre dessous.
- **Tarifs / cartes** : `rounded-2xl`, bordure `border-border`, fond crème ; prix géant, bouton (noir/bleu plein = primaire, blanc + bordure = secondaire), liste à puces avec flèches `↗` bleues, divider pointillé.
- **Boutons / liens** : pills arrondies ; **primaire** noir ou bleu plein (texte blanc), **secondaire** blanc + `border-border` ; les liens portent une flèche **`↗` bleue**.
- **Logo strip** clients en gris clair.
- **Dividers** : hairline `border-border` entre blocs ; pointillés à l'intérieur des cartes.
- **Page « À propos »** ([`APropos.tsx`](src/components/sections/APropos.tsx)) : mise en page éditoriale **deux colonnes décalées** (la colonne droite descend, `lg:mt-32`), chacune avec une **grille de 3 images** (2 sous-colonnes, ratios variés, `rounded-2xl` + hairline + parallax) et un bloc titre/texte. Reprend le block shadcnblocks « about6 », adapté OPUS. Empile sur mobile (colonne gauche d'abord).

## 7bis. Pages internes & primitives partagées *(ajout du chantier Solutions/Fabrication)*

**Contenu centralisé** — toute la copie marketing des pages internes vit dans [`src/content/`](src/content/) (TS typé, importé surtout par des server components → 0 coût bundle) : `types.ts`, `site.ts` (coordonnées **uniques** — adresse/tel/email), `image.ts` (helper `picsum`/`imageUrl`), `materials.ts` (**source unique** des 5 matériaux, consommée par `/materiaux/[slug]`, le showcase `/fabrication` **et** le home `Materiaux.tsx`), `solutions.ts`, `fabrication.ts`, `installations.ts`. Les pages de détail sont des **server components SSG** (`generateStaticParams` + `dynamicParams=false`) rendues via un template unique `[slug]` ; seul l'îlot réalisations est `"use client"`. Drapeau `hasSourceCopy:false` = copie synthétisée (sans PDF source) à relire.

**Primitives réutilisables ajoutées** (`src/components/ui/`, `src/hooks/`) :
- [`DrawLine`](src/components/ui/DrawLine.tsx) — hairline qui se dessine (`scaleX`/`scaleY` 0→1, easing `[0.76,0,0.24,1]`), promu depuis `StatsBar`.
- [`RevealRow`](src/components/ui/RevealRow.tsx) — ligne à hairline + contenu en fade-up au scroll (utilisé par `ReasonsReveal`).
- [`useMediaQuery`](src/hooks/useMediaQuery.ts) — hook SSR-safe, extrait du `matchMedia` de `Solutions.tsx`.
- [`ParallaxImage`](src/components/ui/ParallaxImage.tsx) — prop `unoptimized` ajoutée (sources non-whitelistées, ex. data: URLs admin).
- [`ContactCTA`](src/components/sections/ContactCTA.tsx) — généralisé (props `heading/body/label/href` optionnelles, défauts = formulation d'origine).

**Composants de détail** ([`src/components/detail/`](src/components/detail/)) : `DetailHero` (hero parallax sombre), `ContentBlocks` (rendu générique d'une union `ContentBlock` — prose/list/properties/gallery/split/feature, listes en lignes hairline **sans badge/numéro**), `GalleryStrip`, `RelatedRealisations` (îlot client), `CrossLinks` (`ArrowLink`), `DetailLayout` (orchestration → chaque `page.tsx` ≈ 10 lignes).

**Patterns « wow » des pages internes :**
- **`SolutionsIndex`** ([`/solutions`](src/components/sections/SolutionsIndex.tsx)) — **index typographique au survol** : noms géants des 6 catégories ; au survol (desktop + `(hover:hover)`), un **aperçu monochrome suit le curseur** (`useMotionValue` + `useSpring`, `AnimatePresence`) et les autres noms s'estompent. Vignette inline sur tactile. Aucune carte.
- **`MaterialSwitcher`** ([`/fabrication`](src/components/sections/MaterialSwitcher.tsx)) — **spotlight matériau** plein cadre : crossfade « Apple » réutilisé de `SavoirFaire` (image full-bleed monochrome), sélection discrète (liste sans numéro + flèches + autoplay 6 s, pause au survol/hors-vue/reduced-motion). **Distinct** du home `Materiaux.tsx` (scroll horizontal GSAP) — ici stationnaire/discret.
- **`ReasonsReveal`** ([`/fabrication`](src/components/sections/ReasonsReveal.tsx)) — « 5 raisons » **sans numéro** : titre collant à gauche, lignes éditoriales (`RevealRow`) qui se révèlent au scroll à droite.
- **`JobAccordion`** ([`/emplois`](src/components/emplois/JobAccordion.tsx)) — offres en **accordéon typographique** sur hairlines (pattern `SectorTabs`), métadonnées en texte simple (pas de pilule), `ApplyModal` réutilisé.
- **`RealisationsGallery`** ([`/realisations`](src/components/realisations/RealisationsGallery.tsx)) — **projet vedette plein cadre** (parallax) + masonry pour le reste ; robuste à N dynamique (contexte admin). **Vedette interactive** : l'ordre suit la **position** définie en admin (la 1re est vedette par défaut) ; on peut arriver via `?featured=<id>` (clic d'une carte sur l'accueil) et **cliquer une carte du masonry pour la passer en grand** (`onSelect` → `setFeaturedId` + scroll vers le haut, re-anime la vedette via `key`). Le param est lu avec `useSearchParams` → la galerie est enveloppée dans `<Suspense>` côté page. Les cartes `RealisationCard` acceptent `href` (lien) **ou** `onSelect` (sélection en place) ; carrousel d'images accéléré (1,8 s).
- **`Installations`** ([`/installations`](src/components/sections/Installations.tsx)) — compteurs animés (façon `StatsBar`), bloc « feature » sombre, parallax.

**Footer** ([`Footer.tsx`](src/components/layout/Footer.tsx)) — refondu façon brochure : fond **sombre** (`bg-ink`), bandeau « Durabilité & innovation », bloc contact (coordonnées de `site.ts`), 5 colonnes (Entreprise / Expertises métaux / Solutions / Médias / Nos emplois) dérivées du contenu, icônes sociales (placeholder `href="#"`).

## 8. Pattern « Carousel + GLB » *(à venir — documenté, pas encore construit)*

Objectif : réutiliser le **carousel des matières** pour présenter les matériaux (inox, acier, aluminium, laiton, cuivre) et y intégrer des **objets GLB interactifs**.

Briques déjà existantes :
- [`src/components/sections/Materiaux.tsx`](src/components/sections/Materiaux.tsx) — carousel scroll horizontal (desktop) + pile verticale (mobile). Voir le TODO « replace with actual material photography or 3D model GIF ».
- [`src/components/ui/ModelViewer.tsx`](src/components/ui/ModelViewer.tsx) — visionneuse GLB (react-three-fiber). Pour la rendre **interactive**, ajouter `OrbitControls` de `@react-three/drei`.

Plan d'intégration (futur) : chaque panneau de matière affiche une photo OU un modèle GLB de l'objet, manipulable à la souris/tactile, dans le respect des principes ci-dessus (fond neutre, accent bleu pour les détails, beaucoup d'espace).

---

## 9. Onboarding & smooth scroll

- **Preloader d'arrivée** ([`Preloader.tsx`](src/components/ui/Preloader.tsx)) — réplique du comportement de skiper-ui « Skiper8 » : overlay plein écran (ink) qui fait défiler des mots présentant l'entreprise (matières → nom), puis se retire avec une **animation de courbe SVG** (path animé) révélant le site. framer-motion + `AnimatePresence`. Joue une fois par chargement complet. Liste de mots éditable en haut du fichier.
- **Smooth scroll Lenis** ([`LenisProvider.tsx`](src/components/providers/LenisProvider.tsx)) — enveloppe l'app, piloté par le ticker GSAP et synchronisé avec `ScrollTrigger` ; rend le scroll et toutes les animations au scroll (parallax, pin Matériaux) fluides. Expose `useLenis()` (utilisé par le Preloader pour le scroll-lock). CSS Lenis dans `globals.css`. `lerp: 0.1`.
### Scrollbar custom (look Firefox, partout)

On veut un scrollbar **fin façon Firefox, identique sur tous les navigateurs**. Le scrollbar **natif** ne permet pas ça de façon fiable, d'où la solution **DOM custom**.

**⚠️ Pièges du scrollbar natif (à ne pas refaire) :**
- Dès qu'on pose `scrollbar-width` (standard) sur un élément, **Chrome ignore complètement `::-webkit-scrollbar`** → impossible de combiner les deux pour styler.
- `html::-webkit-scrollbar` ne masque **pas** fiablement la barre racine de Chrome → il faut le sélecteur **`::-webkit-scrollbar` non préfixé (global)**.
- Le rendu natif varie selon la version de Chrome / l'OS → jamais cohérent.

**Solution retenue** (dans [`globals.css`](src/app/globals.css)) — masquer le natif :
```css
html, body { scrollbar-width: none; -ms-overflow-style: none; } /* Firefox / vieux Edge */
::-webkit-scrollbar { display: none; width: 0; height: 0; }     /* Chrome / Edge / Safari */
```
…puis le remplacer par un **élément DOM** : [`CustomScrollbar.tsx`](src/components/ui/CustomScrollbar.tsx).
- Barre fixe à droite, pouce **3px**, gris neutre `rgba(130,130,130,.5)` (lisible sur fond clair **et** sombre), arrondi.
- **Piloté par Lenis** (`useLenis()` → `scroll`/`limit`) avec fallback `window.scroll` ; recalculé sur `resize` + `ResizeObserver(body)`.
- **S'épaissit à ~7px + plus opaque au survol** (`group-hover`). `z-[90]`, desktop uniquement (`md:block`), masqué s'il n'y a pas de débordement.
- Comme c'est notre propre DOM, il s'affiche **à l'identique partout** — aucune dépendance aux quirks navigateur.

## Journal des modifications

| Date | Changement |
|---|---|
| 2026-06-02 | Création du système de design aligné sur OPUS. Bascule des tokens : accent ambre `#f5a020` → bleu `#0048f9` ; foreground `#111113` → `#0c120c` ; surface → blanc `#ffffff` ; bordures → `rgba(151,151,151,.2)`. Polices : Bebas Neue + Barlow Condensed → **Onest** + **Fragment Mono**. Fichiers touchés : `globals.css`, `layout.tsx`. |
| 2026-06-02 | Ajout d'un MCP Playwright (`.mcp.json`) + captures de référence d'OPUS. Documentation du **système de layout OPUS** (section 7) suite à l'analyse visuelle : le layout actuel divergeait fortement (hero vidéo plein écran, cartes photo empilées, titres majuscules) → refonte des sections à venir. |
| 2026-06-02 | **Refonte layout « Full OPUS »** de toute la page d'accueil. Nouvelles primitives `Eyebrow` / `ArrowLink` / `Tag`. Hero type-led (titre géant + vidéo contenue, remplace le hero plein écran). Savoir-faire → accordéon numéroté 01–05 + visuel contenu. Matériaux → carousel de cartes contenues. Solutions & ContactCTA → sections sombres `#0c120c`. Réalisations → grille masonry + tag pills. StatsBar → grands chiffres bleus. Titres passés en **casse normale**. Bouton header : texte blanc sur bleu, pill, glow ambre retiré. |
| 2026-06-02 | **Raffinements demandés.** (1) Retrait de toute teinte verte → noirs neutres (`foreground #141414`, token `ink #111111`). (2) Plus aucun **texte bleu** (stats, codes matières → neutres) ; bleu réservé flèche/point/bouton. (3) Liens = texte souligné neutre + flèche bleue (`ArrowLink` revu). (4) Nouveau `ParallaxImage` appliqué aux cartes (Solutions, Réalisations, Matériaux). (5) **Nav refaite façon OPUS** : barre minimale repliée + overlay plein écran bleu (menu hamburger/« Menu »). |
| 2026-06-02 | **Preloader d'arrivée + smooth scroll.** Nouveau `Preloader` (réplique skiper8 : mots défilants présentant l'entreprise + reveal courbe). Installation de **Lenis** + `LenisProvider` (sync GSAP/ScrollTrigger) pour fluidifier scroll & animations. Parallax renforcé (amplitude 15%). Liens du menu **centrés**. Correctif avertissement next/image (parent `sticky` → wrapper `relative`). |
| 2026-06-02 | **Parallax plus marqué** (amplitude 19% / image 170%, ~32% de mouvement) — vérifié (translateY change au scroll). **UI globale custom** (jamais les défauts navigateur) : `::selection` bleu accent, liens `a { color: inherit; text-decoration: none }`. |
| 2026-06-02 | **Scrollbar custom (DOM) façon Firefox.** Le scrollbar natif s'avérait incohérent/non-appliqué selon la version de Chrome (conflit `scrollbar-width` ↔ `::-webkit-scrollbar`). Solution définitive : natif masqué + composant `CustomScrollbar` (élément DOM fin de 3px piloté par Lenis, identique partout, épaissit au survol). |
| 2026-06-02 | **Animation du menu (inspirée pointlaz.com).** Ouverture plus longue (~1,7 s) en **révélation graduelle ligne par ligne** (liens montant depuis un masque + traits se dessinant en cascade) et **animation de fermeture** qui rejoue l'inverse. Variants framer-motion dynamiques (`custom={i}`) dans `Header.tsx`. |
| 2026-06-03 | **Menu refondu façon pointlaz, en bleu OPUS.** Layout encadré : **cadre + lignes de séparation qui se dessinent** progressivement, **grands liens à gauche**, **infos/contact à droite**, **partenaires (placeholder) en bas**, bouton ✕ pour fermer, scroll-lock Lenis. Fond bleu accent (pas noir) pour respecter OPUS. |
| 2026-06-03 | **Hero = bannière vidéo plein cadre** (`videoLemelin.mp4`, loop/muet/autoplay) façon pointlaz, style OPUS ; texte (« Christian Lemelin » + intro + lien) révélé **après 3 s**. Remplace le hero à vidéo contenue. |
| 2026-06-03 | **Retrait des badges et de la numérotation.** Suppression des primitives `Eyebrow` (pill point bleu + label) et `Tag` (pill outline) et de tous leurs usages (Hero, SavoirFaire, Solutions, Réalisations, Matériaux, ContactCTA) → les sections s'ouvrent directement sur leur titre. Retrait de la numérotation de section (`01`–`05`) de l'accordéon Savoir-faire et de la liste d'intro Matériaux. Bleu accent désormais réservé à la flèche `↗` et au fond de bouton (plus de point d'eyebrow). |
| 2026-06-03 | **Page « À propos » (`/a-propos`).** Nouvelle page reprenant le layout du block shadcnblocks « about6 » : deux colonnes éditoriales décalées, grilles de 3 images (parallax `rounded-2xl`) + blocs de texte, responsive (empile sur mobile). Composants `APropos.tsx` + `app/a-propos/page.tsx`. La route `/a-propos` est celle déjà câblée dans le menu et le footer. |
| 2026-06-03 | **Savoir-faire — titre agrandi** (`clamp(2rem,5vw,3.75rem)` → `clamp(2.5rem,6vw,4.5rem)`). L'essai d'accordéon piloté par le scroll (pin/scrub) a été **annulé** : retour à l'ouverture au clic. |
| 2026-06-03 | **Savoir-faire → « Apple feature block » (skiper-ui Skiper76).** Refonte de la section en **plein écran noir** (`min-h-[100svh]`, **container retiré**, `data-header-theme="dark"`). **L'image englobe toute la section** (full-bleed) et fait un **crossfade façon Apple** reproduit à l'identique (mesuré via MCP Playwright : entrée depuis la droite `x:+8%`/`scale 0.92` → repos `scale 1.14` après décalage 0,16 s, **sortie glissée vers la gauche**, spring + overshoot). Par-dessus : titre + **pastilles-accordéon en verre dépoli** (`backdrop-blur`, icône `+`, dépliage description + flèche `↗`). Image **monochrome (`?grayscale`) + voiles noirs** pour un rendu **noir minimaliste** (placeholder). `motion/react` `AnimatePresence`, responsive (empile sur mobile), fallback `prefers-reduced-motion`. |
| 2026-06-03 | **StatsBar refondu + header auto-hide.** (1) **StatsBar** : fond passé en **crème (`bg-background`, bordure retirée)** pour fusionner avec le reste, chiffres **centrés** et **animés en compteur** (count-up au scroll, formatage FR, fallback reduced-motion), plus d'**espace**, **hairlines qui se dessinent** (façon menu) pour délimiter, et **marquee de partenaires** défilant **droite→gauche** en boucle (bords fondus). (2) **Header** : **auto-hide** — se cache au scroll vers le bas, réapparaît animé au scroll vers le haut (`motion.header`). |
| 2026-06-03 | **Savoir-faire — cadre arrondi + flèches de navigation.** Le bloc devient un **bloc arrondi inséré** (`rounded-[2.5rem]`, marge `p-3 md:p-4`) qui **laisse voir le fond crème** autour des coins. Ajout de **flèches haut/bas** (`CaretUp`/`CaretDown`, cercles en verre dépoli) pour **parcourir le carousel** de façon cyclique (centrées à droite en desktop, en haut à droite sur mobile) ; chaque navigation rejoue le crossfade Apple. |
| 2026-06-05 | **Hero — titre OPUS sur deux lignes décalées.** « Les Entreprises » / « Christian Lemelin » désormais en **deux `<span>` block** décalés en diagonale façon OPUS (1re ligne `-ml-3`, 2e ligne `ml-[0.55em]`, `md:whitespace-nowrap`) et **agrandi** (`clamp(3rem,11vw,9.5rem)` → `clamp(3rem,11vw,10rem)`). Puis, sur demande : **lignes plus séparées** (`leading-[0.88]` → `leading-[1.02]` + `mt-2`), **wrapper pleine largeur ancré à gauche** (retrait `mx-auto`/`max-w-[1400px]`) → le titre colle au **bord gauche de la vidéo**, **intro alignée sous « Christian Lemelin »** (`md:ml-16`, même indent que la 2e ligne `md:ml-16`, 1re ligne `md:-ml-9`) et **lien `↗` poussé au bord droit**. Empile sans rognage sur mobile (nowrap desktop only). Alignements vérifiés au pixel via MCP Playwright (1920 : 2e ligne et intro à 112 px, lien à droite 1872 px). |
| 2026-06-21 | **Courriels de notification (Resend) aux couleurs du site.** Les formulaires « Nous joindre » et candidature envoient désormais un courriel HTML à l'entreprise via Resend ([`backend/src/mail/email-templates.ts`](backend/src/mail/email-templates.ts)). Le gabarit reprend l'esthétique OPUS en **HTML compatible courriel** (layout en tables + styles inline, polices système en repli d'Onest/Fragment Mono) : fond crème `#f3f3f1`, carte blanche à **hairline** + filet d'accent bleu en tête, **labels mono** majuscules `tracking` large en gris, titre en **casse normale**, panneau message crème, et **un seul accent bleu** réservé au bouton pill « Répondre » (texte blanc) — conforme à la règle « pas de texte bleu ». Valeurs hex pleines (et non `rgba`) car les clients courriel gèrent mal la transparence. Voir README « Email notifications (Resend) ». |
| 2026-06-19 | **Réalisations — ordre admin + vedette interactive + carrousel accéléré.** (1) Nouveau champ `position` (backend Prisma + migration) → les réalisations ont un **ordre défini en admin** (flèches « déplacer avant / après » `ArrowLeft`/`ArrowRight` sur chaque carte du tableau de bord ; persiste via `PATCH /realisations/reorder`). L'ordre est respecté partout (accueil épinglées, page `/realisations`, admin). (2) `/realisations` : la **vedette est cliquable/échangeable** — depuis l'accueil, cliquer une carte ouvre `/realisations?featured=<id>` (ce projet en grand) ; sur la page, cliquer une autre carte la passe en vedette (`onSelect`, re-anime via `key`, scroll vers le haut). `useSearchParams` → galerie sous `<Suspense>`. (3) `RealisationCard` : props `href`/`onSelect`, **carrousel accéléré 3 s → 1,8 s**. (4) Réordonnancement **animé** au tableau de bord : les cartes **glissent** vers leur nouvelle position (spring `layout` de motion/react) au lieu de sauter. |
| 2026-06-04 | **Chantier Solutions / Fabrication / détails (18 routes).** Création des pages `/solutions` (index typographique au survol `SolutionsIndex`), `/fabrication` (`ReasonsReveal` sans numéro + `MaterialSwitcher` plein cadre), `/installations`, `/contact`, des templates `[slug]` (6 détails solutions + 5 matériaux, server components SSG) et refonte de `/realisations` (vedette + masonry) et `/emplois` (`JobAccordion`). **Contenu centralisé** dans `src/content/` (coordonnées **du PDF** : 680 rue du Carbone / (418) 841-1220 — remplace `418 682-1750` dans Header + Footer). Nouvelles primitives `DrawLine`/`RevealRow`/`useMediaQuery`, composants `src/components/detail/*`, `ContactCTA` & `ParallaxImage` généralisés. **Footer** refondu (sombre, 5 colonnes brochure, liens dérivés du contenu). `Materiaux.tsx` consomme désormais `MATERIALS` (source unique). Contraintes respectées : aucun texte bleu, aucun badge/numéro/eyebrow/carte ; voir §7bis. Pages sans copie PDF (`mobilier-laboratoire`, `prototypes`, `pieces-sur-mesure`, `aluminium`, `laiton`, `cuivre`) = copie synthétisée (`hasSourceCopy:false`) à relire. |
