// Idempotent seed: an admin user plus the demo jobs/réalisations that used to
// live in src/lib/admin-context.tsx. Safe to run repeatedly (upserts the admin,
// skips jobs/réalisations if any already exist). Compiled to dist/seed.js and
// run by the Docker entrypoint.
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'password';

const DUMMY_JOBS = [
  {
    title: 'Ingénieur Fabrication Métallique',
    description:
      "Nous cherchons un ingénieur expérimenté en fabrication métallique pour rejoindre notre équipe. Responsable du design et de l'optimisation des processus de production.",
    location: 'Québec, QC',
    type: 'full-time',
    department: 'Ingénierie',
    salary: '65 000 - 85 000 $/an',
  },
  {
    title: 'Soudeur Qualifié',
    description:
      "Recherchons soudeur TIG/MIG avec au moins 5 ans d'expérience. Travail sur inox, acier et aluminium.",
    location: 'Québec, QC',
    type: 'full-time',
    department: 'Production',
    salary: '55 000 - 70 000 $/an',
  },
];

const DUMMY_REALISATIONS = [
  {
    name: 'Mobilier hospitalier en inox',
    images: [
      '/assets/1780581925672-IMG_1281.jpeg',
      '/assets/1780581931474-IMG_1280.jpeg',
    ],
    pinned: true,
  },
  {
    name: 'Bar lounge — hôtellerie',
    images: [
      '/assets/1780581840629-IMG_1294.jpeg',
      '/assets/1780581884668-IMG_1288.jpeg',
    ],
    pinned: true,
  },
  {
    name: 'Bar circulaire en laiton',
    images: ['/assets/1780581873317-IMG_1291.jpeg'],
    pinned: true,
  },
  {
    name: 'Aménagement de restaurant',
    images: ['/assets/1780581850553-IMG_1293.jpeg'],
    pinned: true,
  },
  {
    name: 'Cuisine extérieure sur mesure',
    images: ['/assets/1780581936961-IMG_1277.jpeg'],
    pinned: true,
  },
  {
    name: "Escalier & structure d'atelier",
    images: ['/assets/1780581858443-IMG_1292.jpeg'],
    pinned: true,
  },
];

async function main(): Promise<void> {
  // Admin user (upsert — keeps the password in sync on re-seed)
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.adminUser.upsert({
    where: { username: ADMIN_USERNAME },
    update: { passwordHash },
    create: { username: ADMIN_USERNAME, passwordHash },
  });

  // Demo content (jobs + réalisations) — only in dev. Set SEED_DEMO_DATA=false
  // in prod so a fresh Supabase DB starts empty (the admin user is still created).
  const seedDemo = process.env.SEED_DEMO_DATA !== 'false';
  if (seedDemo) {
    if ((await prisma.job.count()) === 0) {
      await prisma.job.createMany({ data: DUMMY_JOBS });
    }
    if ((await prisma.realisation.count()) === 0) {
      await prisma.realisation.createMany({ data: DUMMY_REALISATIONS });
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Seed complete (demo data: ${seedDemo})`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
