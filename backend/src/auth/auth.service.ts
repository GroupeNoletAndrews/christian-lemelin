import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<{ token: string; username: string }> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { username },
    });
    if (!admin) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const token = await this.jwt.signAsync({
      sub: admin.id,
      username: admin.username,
    });
    return { token, username: admin.username };
  }
}
