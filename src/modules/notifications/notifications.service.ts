import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: string, query: any) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const where: any = { somiteeId };
    if (query.read !== undefined) where.read = query.read === 'true' || query.read === true;
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.notification.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async markRead(id: string, somiteeId: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, somiteeId } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async markAllRead(somiteeId: string) {
    const result = await this.prisma.notification.updateMany({ where: { somiteeId, read: false }, data: { read: true } });
    return { updated: result.count };
  }
}
