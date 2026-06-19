import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async get(id: string) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Emploi introuvable');
    return job;
  }

  create(dto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        type: dto.type,
        department: dto.department,
        salary: dto.salary ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateJobDto) {
    await this.get(id);
    return this.prisma.job.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        type: dto.type,
        department: dto.department,
        salary: dto.salary ?? null,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.get(id);
    await this.prisma.job.delete({ where: { id } });
  }
}
