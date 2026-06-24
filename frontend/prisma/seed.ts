// Idempotent seed: an admin user plus optional demo jobs/réalisations.
// Run once against Supabase with `npm run db:seed` (loads .env). Uses the DIRECT
// (non-pooled) connection — the transaction pooler breaks Prisma mid-seed.
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
})

const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME ?? "admin"
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "password"

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

const DUMMY_REALISATIONS = [
  {
    name: "Mobilier hospitalier en inox",
    images: [
      "/assets/1780581925672-IMG_1281.jpeg",
      "/assets/1780581931474-IMG_1280.jpeg",
    ],
    pinned: true,
  },
  {
    name: "Bar lounge — hôtellerie",
    images: [
      "/assets/1780581840629-IMG_1294.jpeg",
      "/assets/1780581884668-IMG_1288.jpeg",
    ],
    pinned: true,
  },
  {
    name: "Bar circulaire en laiton",
    images: ["/assets/1780581873317-IMG_1291.jpeg"],
    pinned: true,
  },
  {
    name: "Aménagement de restaurant",
    images: ["/assets/1780581850553-IMG_1293.jpeg"],
    pinned: true,
  },
  {
    name: "Cuisine extérieure sur mesure",
    images: ["/assets/1780581936961-IMG_1277.jpeg"],
    pinned: true,
  },
  {
    name: "Escalier & structure d'atelier",
    images: ["/assets/1780581858443-IMG_1292.jpeg"],
    pinned: true,
  },
]

async function main(): Promise<void> {
  // Admin user (upsert — keeps the password in sync on re-seed).
  const passwordHash = await hash(ADMIN_PASSWORD, 10)
  await prisma.adminUser.upsert({
    where: { username: ADMIN_USERNAME },
    update: { passwordHash },
    create: { username: ADMIN_USERNAME, passwordHash },
  })

  // Demo content (jobs + réalisations) — only when SEED_DEMO_DATA !== 'false'.
  // Set SEED_DEMO_DATA=false in prod so a fresh DB starts empty (admin still created).
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
