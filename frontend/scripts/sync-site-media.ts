// Upload static site media + demo réalisation images to Supabase Storage for
// the CURRENT environment (reads .env.local / .env via @next/env, exactly like
// the app). Idempotent: ensures the public bucket exists and upserts every
// file, so re-running is safe. Source files live under frontend/public.
//
//   npm run media:sync          # → whatever .env.local points at (local by default)
//
// To target prod, run with prod SUPABASE_URL + SUPABASE_SECRET_KEY in the env.
import { readFile } from "node:fs/promises"
import path from "node:path"
import { loadEnvConfig } from "@next/env"
import { createClient } from "@supabase/supabase-js"
import { MEDIA_BUCKET, SITE_MEDIA } from "../src/lib/media"
import { SEED_REALISATIONS, seedImageKeys } from "../prisma/seed-realisations"

loadEnvConfig(process.cwd())

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const key =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SECRET_KEY (or the NEXT_PUBLIC_/SERVICE_ROLE fallbacks).",
  )
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
const PUBLIC_DIR = path.join(process.cwd(), "public")

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
}
function contentType(file: string): string {
  const ext = file.split(".").pop()?.toLowerCase() ?? ""
  return CONTENT_TYPES[ext] ?? "application/octet-stream"
}

interface Item {
  source: string // relative to frontend/public
  key: string // storage key inside MEDIA_BUCKET
}

const items: Item[] = [
  // Static site assets
  { source: "assets/logo_eclemelin.png", key: SITE_MEDIA.logo },
  { source: "videos/videoLemelin.mp4", key: SITE_MEDIA.heroVideo },
  { source: "assets/1780581925672-IMG_1281.jpeg", key: SITE_MEDIA.savoirFaire.mobilier },
  { source: "assets/1780581858443-IMG_1292.jpeg", key: SITE_MEDIA.savoirFaire.fabrication },
  { source: "assets/1780581873317-IMG_1291.jpeg", key: SITE_MEDIA.savoirFaire.decoupeLaser },
  { source: "assets/1780581884668-IMG_1288.jpeg", key: SITE_MEDIA.savoirFaire.soudure },
  { source: "assets/1780581936961-IMG_1277.jpeg", key: SITE_MEDIA.savoirFaire.polissage },
]

// Demo réalisation images (keys must match prisma/seed.ts).
for (const r of SEED_REALISATIONS) {
  const keys = seedImageKeys(r)
  r.sources.forEach((src, i) => items.push({ source: src, key: keys[i] }))
}

async function ensureBucket(): Promise<void> {
  const { data } = await supabase.storage.getBucket(MEDIA_BUCKET)
  if (data) return
  const { error } = await supabase.storage.createBucket(MEDIA_BUCKET, {
    public: true,
  })
  if (error && !/already exists/i.test(error.message)) throw error
  console.log(`Created public bucket "${MEDIA_BUCKET}".`)
}

async function main(): Promise<void> {
  await ensureBucket()
  for (const item of items) {
    const bytes = await readFile(path.join(PUBLIC_DIR, item.source))
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(item.key, bytes, {
        contentType: contentType(item.source),
        upsert: true,
      })
    if (error) {
      console.error(`  ✗ ${item.key} — ${error.message}`)
      process.exitCode = 1
    } else {
      console.log(`  ✓ ${item.key}`)
    }
  }
  console.log(`\nSynced ${items.length} files to ${url} / ${MEDIA_BUCKET}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
