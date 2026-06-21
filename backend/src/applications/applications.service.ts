import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(
    dto: CreateApplicationDto,
    cv: { path: string; originalname: string } | null,
  ): Promise<{ id: string }> {
    const created = await this.prisma.application.create({
      data: {
        jobId: dto.jobId ?? null,
        name: dto.name,
        email: dto.email,
        phone: dto.phone ?? null,
        message: dto.message ?? null,
        cvPath: cv?.path ?? null,
      },
      select: { id: true },
    });

    // Resolve the job title (if any) so the email is self-explanatory.
    let jobTitle: string | null = null;
    if (dto.jobId) {
      const job = await this.prisma.job.findUnique({
        where: { id: dto.jobId },
        select: { title: true },
      });
      jobTitle = job?.title ?? null;
    }

    // Best-effort notification — never let an email failure break the submission.
    await this.mail.sendApplicationNotification({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      message: dto.message ?? null,
      jobTitle,
      cvPath: cv?.path ?? null,
      cvFilename: cv?.originalname ?? null,
    });

    return created;
  }

  list() {
    return this.prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
