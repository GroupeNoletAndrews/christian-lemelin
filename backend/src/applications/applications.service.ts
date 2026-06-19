import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateApplicationDto,
    cvPath: string | null,
  ): Promise<{ id: string }> {
    const created = await this.prisma.application.create({
      data: {
        jobId: dto.jobId ?? null,
        name: dto.name,
        email: dto.email,
        phone: dto.phone ?? null,
        message: dto.message ?? null,
        cvPath,
      },
      select: { id: true },
    });
    return created;
  }

  list() {
    return this.prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
