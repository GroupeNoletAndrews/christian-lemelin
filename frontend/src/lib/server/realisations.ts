import { prisma } from "./prisma"
import { AppError } from "./http"
import { deleteMediaObjects } from "./storage"

/** Mirrors MAX_PINNED_REALISATIONS in src/types/admin.ts. */
export const MAX_PINNED = 6

export function listRealisations() {
  return prisma.realisation.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  })
}

export async function getRealisation(id: string) {
  const realisation = await prisma.realisation.findUnique({ where: { id } })
  if (!realisation) throw new AppError(404, "Réalisation introuvable")
  return realisation
}

/** Reorder: `ids` is the full list of réalisation ids in the desired order. */
export async function reorderRealisations(ids: string[]): Promise<{ ok: true }> {
  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.realisation.update({ where: { id }, data: { position: index } }),
    ),
  )
  return { ok: true }
}

export async function createRealisation(dto: {
  name: string
  images: string[]
  pinned?: boolean
}) {
  // Silently un-pin if the cap is full (matches the original addRealisation).
  let pinned = dto.pinned ?? false
  if (pinned) {
    const count = await prisma.realisation.count({ where: { pinned: true } })
    if (count >= MAX_PINNED) pinned = false
  }
  // New réalisations go to the end of the order.
  const max = await prisma.realisation.aggregate({ _max: { position: true } })
  const position = (max._max.position ?? -1) + 1
  return prisma.realisation.create({
    data: { name: dto.name, images: dto.images, pinned, position },
  })
}

export async function updateRealisation(
  id: string,
  dto: { name: string; images: string[]; pinned?: boolean },
) {
  const { updated, removed } = await prisma.$transaction(async (tx) => {
    const current = await tx.realisation.findUnique({ where: { id } })
    if (!current) throw new AppError(404, "Réalisation introuvable")

    const wantPinned = dto.pinned ?? false
    if (wantPinned && !current.pinned) {
      const count = await tx.realisation.count({ where: { pinned: true } })
      if (count >= MAX_PINNED) {
        throw new AppError(
          409,
          `Maximum de ${MAX_PINNED} réalisations épinglées atteint`,
        )
      }
    }

    // Images dropped from the réalisation become orphaned objects to clean up.
    const next = new Set(dto.images)
    const removed = current.images.filter((img) => !next.has(img))

    const updated = await tx.realisation.update({
      where: { id },
      data: { name: dto.name, images: dto.images, pinned: wantPinned },
    })
    return { updated, removed }
  })

  // Best-effort, after the row is safely updated.
  if (removed.length) await deleteMediaObjects(removed)
  return updated
}

export async function deleteRealisation(id: string): Promise<void> {
  const realisation = await getRealisation(id)
  await prisma.realisation.delete({ where: { id } })
  // Best-effort: remove the réalisation's images from the public bucket.
  await deleteMediaObjects(realisation.images)
}

/** Toggle pinned; enforce the cap atomically. */
export async function togglePinRealisation(id: string) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.realisation.findUnique({ where: { id } })
    if (!current) throw new AppError(404, "Réalisation introuvable")

    if (!current.pinned) {
      const count = await tx.realisation.count({ where: { pinned: true } })
      if (count >= MAX_PINNED) {
        throw new AppError(
          409,
          `Maximum de ${MAX_PINNED} réalisations épinglées atteint`,
        )
      }
    }

    return tx.realisation.update({
      where: { id },
      data: { pinned: !current.pinned },
    })
  })
}
