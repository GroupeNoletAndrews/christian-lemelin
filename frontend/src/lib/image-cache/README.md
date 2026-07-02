# image-cache — cache client d'images (drop-in)

Service worker **cache-first** pour les images servies par Supabase Storage
(et l'optimiseur Next `/_next/image`). Pensé pour être copié tel quel dans un
autre projet Next.js + Supabase.

## Comment ça marche

- Les URLs d'images du site sont **versionnées** (`?v=updatedAt` via
  `imgSrc()`) : remplacer une image change l'URL. Le worker peut donc les
  servir **cache-first, sans revalidation** — un hit est toujours à jour.
- Les images **non versionnées** (logos statiques…) sont servies en
  **stale-while-revalidate** : affichage instantané depuis le cache, refresh en
  arrière-plan pour la visite suivante.
- Tout le reste (pages, API, vidéos) n'est **pas intercepté**.
- Le cache est borné (300 entrées, FIFO) et versionné (`cl-images-v1`).

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `public/image-cache-sw.js` | Le service worker (stratégies de cache). |
| `src/lib/image-cache/register.ts` | Enregistrement (+ garde admin/preview) et désinscription. |
| `src/lib/image-cache/ImageCache.tsx` | Composant client à monter dans le root layout (prod uniquement). |

## Installer dans un autre projet

1. Copier `public/image-cache-sw.js` et le dossier `src/lib/image-cache/`.
2. Monter `<ImageCache />` dans le root layout (`app/layout.tsx`).
3. Si le projet ne versionne pas ses URLs d'images, tout passera en
   stale-while-revalidate — correct mais moins agressif ; idéalement ajouter un
   `?v=<updatedAt>` aux URLs (voir `imgSrc()` dans `src/lib/media.ts`).
4. Autre hébergeur d'images que Supabase : adapter `STORAGE_PATH` dans le worker.

## Débogage

- DevTools → Application → Service Workers / Cache Storage (`cl-images-v1`).
- 2ᵉ visite : les images doivent venir « from ServiceWorker ».
- Pour tout invalider : bump `CACHE` dans le worker, ou appeler
  `unregisterImageCache()` depuis la console.
