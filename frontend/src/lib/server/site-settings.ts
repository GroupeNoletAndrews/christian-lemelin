import { prisma } from "./prisma"

// Thin accessors over the SiteSetting key/value table. Reusable for any small
// persisted config (currently the réalisations + À-propos layout choices).

export async function getSiteSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } })
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
}

export async function getSiteSetting(key: string): Promise<string | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key } })
  return row?.value ?? null
}

export async function setSiteSettings(entries: Record<string, string>): Promise<void> {
  const keys = Object.keys(entries)
  if (!keys.length) return
  await prisma.$transaction(
    keys.map((key) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: entries[key] },
        update: { value: entries[key] },
      }),
    ),
  )
}
