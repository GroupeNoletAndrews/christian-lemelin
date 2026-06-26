// Shared demo réalisation seed data: project name + the source image files
// (paths relative to frontend/public). Used by BOTH the DB seed
// (prisma/seed.ts) and the media uploader (scripts/sync-site-media.ts) so the
// storage keys persisted in the DB always match the files actually uploaded.
import { realisationImageKey } from "../src/lib/media"

export interface SeedRealisation {
  name: string
  /** Source files under frontend/public, uploaded to photos/realisations/. */
  sources: string[]
  pinned: boolean
}

export const SEED_REALISATIONS: SeedRealisation[] = [
  {
    name: "Mobilier hospitalier en inox",
    sources: [
      "assets/1780581925672-IMG_1281.jpeg",
      "assets/1780581931474-IMG_1280.jpeg",
    ],
    pinned: true,
  },
  {
    name: "Bar lounge — hôtellerie",
    sources: [
      "assets/1780581840629-IMG_1294.jpeg",
      "assets/1780581884668-IMG_1288.jpeg",
    ],
    pinned: true,
  },
  {
    name: "Bar circulaire en laiton",
    sources: ["assets/1780581873317-IMG_1291.jpeg"],
    pinned: true,
  },
  {
    name: "Aménagement de restaurant",
    sources: ["assets/1780581850553-IMG_1293.jpeg"],
    pinned: true,
  },
  {
    name: "Cuisine extérieure sur mesure",
    sources: ["assets/1780581936961-IMG_1277.jpeg"],
    pinned: true,
  },
  {
    name: "Escalier & structure d'atelier",
    sources: ["assets/1780581858443-IMG_1292.jpeg"],
    pinned: true,
  },
]

/** Storage keys (photos/realisations/<slug>-<n>.jpg) for a seed réalisation. */
export function seedImageKeys(r: SeedRealisation): string[] {
  return r.sources.map((_, i) => realisationImageKey(r.name, i + 1, "jpg"))
}
