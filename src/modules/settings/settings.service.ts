import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Profile not found');
    }
    return user;
  }

  async updateProfile(userId: string, body: any) {
    return this.prisma.user.update({ where: { id: userId }, data: body });
  }

  async changePassword(userId: string, body: any) {
    // TODO: verify currentPassword and hash new password
    return null;
  }

  async printTemplate() {
    return this.prisma.printTemplate.findFirst({ where: { id: 'default' } });
  }

  async updatePrintTemplate(body: any) {
    return this.prisma.printTemplate.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...body },
      update: body
    });
  }
}
