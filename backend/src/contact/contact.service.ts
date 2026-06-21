import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateContactDto): Promise<{ id: string }> {
    const created = await this.prisma.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone ?? null,
        message: dto.message,
      },
      select: { id: true },
    });

    // Best-effort notification — never let an email failure break the submission.
    await this.mail.sendContactNotification({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      message: dto.message,
    });

    return created;
  }

  list() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
