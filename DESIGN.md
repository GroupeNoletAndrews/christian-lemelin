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
| `accent` | `#0048f9` | Accent bleu — **uniquement** flèche de lien, point d'eyebrow, fond de bouton | `bg-accent` |
| `accent-hover` | `#0039c4` | Survol de l'accent (dérivé) | `bg-accent-hover` |
| `border` | `rgba(151,151,151,.2)` | Séparateurs fins (hairlines) | `border-border` |

⚠️ **Pas de texte bleu.** Le bleu ne sert que pour : la flèche `↗` des liens, le point de l'eyebrow, et le fond des boutons (texte blanc dessus). Jamais pour du texte (titres, chiffres, codes…). Pas de teinte verte nulle part — les noirs sont neutres.

> ⚠️ **Migration en cours :** certains composants utilisent encore `text-zinc-*`, `black/8`, `black/12`. À remplacer progressivement par les tokens ci-dessus.

---

## 3. Typographie

Chargées via `next/font/google` dans [`src/app/layout.tsx`](src/app/layout.tsx).

| Police | Rôle | Classe |
|---|---|---|
| **Onest** (variable) | Titres **et** corps de texte | `font-sans` / `font-display` (par défaut sur `body`) |
| **Fragment Mono** (400) | Eyebrows, labels, codes, numéros de section (`01 — 05`) | `font-mono` |

**Conventions :**
- **Titres** : Onest, **casse normale** (pas de capitales), poids medium/semibold, grande taille, `leading` serré (`leading-[1.05]`). OPUS n'utilise pas de capitales condensées.
- **Eyebrows / labels** : Fragment Mono, petit, `uppercase`, `tracking` large (`tracking-[0.18em]`), souvent en `text-foreground-muted` ou `text-accent`.
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
- [`Eyebrow`](src/components/ui/Eyebrow.tsx) — pill arrondie (point bleu + label mono UPPERCASE). Prop `dark` pour sections sombres.
- [`ArrowLink`](src/components/ui/ArrowLink.tsx) — lien bleu avec flèche `↗`.
- [`Tag`](src/components/ui/Tag.tsx) — pill outline arrondie. Prop `dark`.

- **Boutons / CTA** : pill `rounded-full`, fond `bg-accent`, **texte blanc** (jamais texte sombre sur le bleu), survol `bg-accent-hover`. Variante secondaire : bordure `border-border` + texte `text-foreground`.
- **Cartes / panneaux** : `bg-surface`, séparation par `border-border` (hairline) plutôt qu'ombres marquées.
- **Eyebrow de section** : Fragment Mono + numéro (`01`, `02`…) + label en `uppercase tracking`.
- **Focus** : contour bleu `#0048f9` (défini globalement via `:focus-visible`). Ne pas le retirer.

---

## 6. Motion

- Smooth-scroll déjà en place (Lenis / GSAP ScrollTrigger).
- Animations d'entrée discrètes (fondu, léger translate).
- **Toujours** garder un fallback `prefers-reduced-motion` (déjà respecté dans `Materiaux.tsx`, `ModelViewer.tsx`).

---

## 7. Layout & patterns OPUS *(observés sur le template — à reproduire)*

Captures de référence prises au 1440px. Le layout d'OPUS repose sur ces patterns — **toute nouvelle section doit s'en inspirer.**

- **Navigation** : barre **minimale** transparente (logo à gauche + un seul bouton pill « Menu » bleu à droite), repliée sur **tous** les écrans comme OPUS. Au clic → **overlay plein écran bleu** (`bg-accent`) : liens en très grand **centrés** (Onest), barre contact + bouton « Nous joindre » blanc en bas. Le bouton bascule en « Fermer » (pill blanc, texte foncé). Sticky : fond `backdrop-blur` + hairline au scroll.
  - **Animation d'ouverture/fermeture (façon pointlaz.com)** : révélation **graduelle ligne par ligne** — chaque lien **monte depuis un masque** (`overflow-hidden`) et un **trait se dessine** (`scaleX`) sous lui, en cascade (`custom={i}`, ~1,7 s). La **fermeture** rejoue l'inverse (liens redescendent dans le masque, traits se rétractent) puis l'overlay s'efface. Variants `overlayV`/`linkV`/`lineV`/`fadeV` dans [`Header.tsx`](src/components/layout/Header.tsx).
- **Liens** : texte **souligné** (couleur neutre `text-foreground` ou `text-white`), souligné fin `underline-offset`, + flèche **`↗` bleue**. Le texte n'est **jamais** bleu. Composant [`ArrowLink`](src/components/ui/ArrowLink.tsx).
- **Parallax images** : sur les cartes (Solutions, Réalisations, Matériaux), l'image est sur-dimensionnée (**170%**) et translate verticalement (`amount` ~19%) au scroll → effet marqué « les images me suivent ». Composant [`ParallaxImage`](src/components/ui/ParallaxImage.tsx), respecte `prefers-reduced-motion`, fluide via Lenis.
- **Hero** : **bannière vidéo plein cadre** (`videoLemelin.mp4`, autoplay/muette/loop, sans contrôles) façon pointlaz, en style OPUS. Contenu ancré en bas à gauche, texte blanc sur dégradé de lisibilité : eyebrow pill + titre **immense** « Christian Lemelin » (Onest) + intro + lien `↗`. Le texte **apparaît après 3 s** (révélation en cascade). `data-header-theme="dark"`. Voir [`Hero.tsx`](src/components/sections/Hero.tsx).
- **Eyebrow = pill** : `rounded-full`, fond subtil (`bg-surface`/dark), petit **point bleu** + label **UPPERCASE** en Fragment Mono. Ex. « OUR VISION », « OUR PROCESS », « PRICING ». À utiliser en tête de chaque section.
- **Sections alternées** : blanc `#fff` / crème `#f3f3f1` / **noir neutre `#111111`** (token `ink`, texte blanc — **pas de teinte verte**). Très grand padding vertical (respiration).
- **Titres** : Onest, **casse normale**, taille géante (`clamp`), `leading` serré. Jamais tout en majuscules.
- **Stats** : très grands chiffres en **`text-foreground` neutre** (pas de bleu) + petit label gris en dessous.
- **Liste de services** : **accordéon numéroté** `01`–`05`, grand titre sentence-case à gauche du numéro, `+` à droite, séparateurs hairline pleine largeur.
- **Cartes process** (section sombre) : `rounded-2xl`, bordure subtile, numéro `01`–`04` + titre ; la carte active est plus claire.
- **Grille projets** : **masonry asymétrique**, cartes = image `rounded-2xl` contenue + titre dessous + **tag pills** (outline `rounded-full` : Branding, Motion…).
- **Tarifs / cartes** : `rounded-2xl`, bordure `border-border`, fond crème ; prix géant, bouton (noir/bleu plein = primaire, blanc + bordure = secondaire), liste à puces avec flèches `↗` bleues, divider pointillé. Badge « Best Value » bleu.
- **Boutons / liens** : pills arrondies ; **primaire** noir ou bleu plein (texte blanc), **secondaire** blanc + `border-border` ; les liens portent une flèche **`↗` bleue**.
- **Logo strip** clients en gris clair.
- **Dividers** : hairline `border-border` entre blocs ; pointillés à l'intérieur des cartes.

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
| 2026-06-03 | **Gestion des réalisations (admin) + nettoyage de la nav admin.** Nouveau type `Realisation` (nom, images ordonnées, `pinned`, catégorie). `AdminContext` étendu : CRUD réalisations, épinglage **max 6** à l'accueil, persistance **localStorage** (`ecl_realisations_v1`). Téléversement d'images via fichiers, **compressées côté client** (canvas → JPEG ≤1600px) pour tenir dans le quota localStorage (`src/lib/image-utils.ts`). Nouveau composant `ImageManager` (upload, réordonner, supprimer, couverture = 1re image). Dashboard refondu en **onglets Emplois / Réalisations** + cartes réalisations (épingler/éditer/supprimer). Page `/admin/dashboard/realisations/[id]/edit` (création/édition). Section **Réalisations de l'accueil** alimentée par les réalisations épinglées avec **carrousel d'images au survol** (`Realisations.tsx`). **Nav du site retirée de l'admin** via `SiteChrome` (cache Header/Footer/Preloader/Lenis/scrollbar sur `/admin*`) + lien « Retour au site ». |
| 2026-06-03 | **Section admin + page Emplois refondues OPUS.** `/admin` (connexion), `/admin/dashboard`, `/admin/dashboard/jobs/[jobId]/edit` (création/édition), `JobPreview` et la page publique `/emplois` migrés des couleurs ambre/Bebas en dur (`#f5a020`, `font-bebas-neue`, `font-barlow-condensed`) vers les tokens : `bg-background`/`bg-surface`, `border-border` (hairlines), titres **Onest casse normale**, labels **Fragment Mono** UPPERCASE, badges → pills `Tag` neutres, boutons → pills `bg-accent text-white` (secondaire = bordure). Réutilise `Eyebrow`/`Tag`. **Correctif bug** : le bouton « Ajouter un emploi » pointait vers `/admin/dashboard/jobs/create` (404) → corrigé vers `/admin/dashboard/jobs/create/edit` (la route `[jobId]/edit` gère déjà le mode création). Aperçu emploi rendu responsive (sticky desktop, repliable mobile). |
