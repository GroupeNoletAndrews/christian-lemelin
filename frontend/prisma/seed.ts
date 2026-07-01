// Idempotent seed: optional demo jobs/réalisations. (Admin login is Supabase
// Auth now — create admin users in Supabase Studio, not here.)
// Run once against Supabase with `npm run db:seed` (loads .env). Uses the DIRECT
// (non-pooled) connection — the transaction pooler breaks Prisma mid-seed.
import { PrismaClient } from "@prisma/client"
import { SEED_REALISATIONS, seedImageKeys } from "./seed-realisations"

const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
})

const DUMMY_JOBS = [
  {
    title: "Ingénieur Fabrication Métallique",
    description:
      "Nous cherchons un ingénieur expérimenté en fabrication métallique pour rejoindre notre équipe. Responsable du design et de l'optimisation des processus de production.",
    location: "Québec, QC",
    type: "full-time",
    department: "Ingénierie",
    salary: "65 000 - 85 000 $/an",
  },
  {
    title: "Soudeur Qualifié",
    description:
      "Recherchons soudeur TIG/MIG avec au moins 5 ans d'expérience. Travail sur inox, acier et aluminium.",
    location: "Québec, QC",
    type: "full-time",
    department: "Production",
    salary: "55 000 - 70 000 $/an",
  },
]

// Demo réalisations reference Supabase storage keys (photos/realisations/...).
// The matching image files are uploaded by `npm run media:sync` from the same
// source list (prisma/seed-realisations.ts), so keys and files stay in sync.
const DUMMY_REALISATIONS = SEED_REALISATIONS.map((r) => ({
  name: r.name,
  images: seedImageKeys(r),
  pinned: r.pinned,
}))

async function main(): Promise<void> {
  // Demo content (jobs + réalisations) — only when SEED_DEMO_DATA !== 'false'.
  // Set SEED_DEMO_DATA=false in prod so a fresh DB starts empty.
  const seedDemo = process.env.SEED_DEMO_DATA !== "false"
  if (seedDemo) {
    if ((await prisma.job.count()) === 0) {
      await prisma.job.createMany({ data: DUMMY_JOBS })
    }
    if ((await prisma.realisation.count()) === 0) {
      await prisma.realisation.createMany({ data: DUMMY_REALISATIONS })
    }
  }

  console.log(`Seed complete (demo data: ${seedDemo})`)
}

main()
  .catch((err) => {
    console.error("Seed failed:", err)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
