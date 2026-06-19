import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRealisationDto,
  UpdateRealisationDto,
} from './dto/realisation.dto';

/** Mirrors MAX_PINNED_REALISATIONS in the frontend (src/types/admin.ts). */
export const MAX_PINNED = 6;

@Injectable()
export class RealisationsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.realisation.findMany({
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /** Reorder: `ids` is the full list of réalisation ids in the desired order. */
  async reorder(ids: string[]): Promise<{ ok: true }> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.realisation.update({
          where: { id },
          data: { position: index },
        }),
      ),
    );
    return { ok: true };
  }

  async get(id: string) {
    const realisation = await this.prisma.realisation.findUnique({
      where: { id },
    });
    if (!realisation) throw new NotFoundException('Réalisation introuvable');
    return realisation;
  }

  async create(dto: CreateRealisationDto) {
    // Mirror the original addRealisation: silently un-pin if the cap is full.
    let pinned = dto.pinned ?? false;
    if (pinned) {
      const count = await this.prisma.realisation.count({
        where: { pinned: true },
      });
      if (count >= MAX_PINNED) pinned = false;
    }
    // New réalisations go to the end of the order.
    const max = await this.prisma.realisation.aggregate({
      _max: { position: true },
    });
    const position = (max._max.position ?? -1) + 1;
    return this.prisma.realisation.create({
      data: { name: dto.name, images: dto.images, pinned, position },
    });
  }

  async update(id: string, dto: UpdateRealisationDto) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.realisation.findUnique({ where: { id } });
      if (!current) throw new NotFoundException('Réalisation introuvable');

      const wantPinned = dto.pinned ?? false;
      if (wantPinned && !current.pinned) {
        const count = await tx.realisation.count({ where: { pinned: true } });
        if (count >= MAX_PINNED) {
          throw new ConflictException(
            `Maximum de ${MAX_PINNED} réalisations épinglées atteint`,
          );
        }
      }

      return tx.realisation.update({
        where: { id },
        data: { name: dto.name, images: dto.images, pinned: wantPinned },
      });
    });
  }

  async remove(id: string): Promise<void> {
    await this.get(id);
    await this.prisma.realisation.delete({ where: { id } });
  }

  /** Toggle pinned; enforce the cap atomically. */
  async togglePin(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.realisation.findUnique({ where: { id } });
      if (!current) throw new NotFoundException('Réalisation introuvable');

      if (!current.pinned) {
        const count = await tx.realisation.count({ where: { pinned: true } });
        if (count >= MAX_PINNED) {
          throw new ConflictException(
            `Maximum de ${MAX_PINNED} réalisations épinglées atteint`,
          );
        }
      }

      return tx.realisation.update({
        where: { id },
        data: { pinned: !current.pinned },
      });
    });
  }
}
