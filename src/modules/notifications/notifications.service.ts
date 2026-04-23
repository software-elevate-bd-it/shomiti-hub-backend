import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: number, query: any) {
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 20);
      const where: any = {somiteeId};
      if (query.read !== undefined) where.read = query.read === 'true' || query.read === true;
      const [data, total] = await Promise.all([
        this.prisma.notification.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {createdAt: 'desc'},
        }),
        this.prisma.notification.count({where}),
      ]);
      return {data, meta: {page, limit, total, totalPages: Math.ceil(total / limit)}};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('notifications.service.service.list error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('notifications.service.service.list unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to list');
    }
  }

  async markRead(id: number, somiteeId: number) {
    try {
      const notification = await this.prisma.notification.findFirst({where: {id, somiteeId}});
      if (!notification) {
        throw new NotFoundException('Notification not found');
      }
      return this.prisma.notification.update({where: {id}, data: {read: true}});
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('notifications.service.service.markRead error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
        });
      } else {
        console.error('notifications.service.service.markRead unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to markRead');
    }
  }

  async markAllRead(somiteeId: number) {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {somiteeId, read: false},
        data: {read: true},
      });
      return {updated: result.count};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('notifications.service.service.markAllRead error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
        });
      } else {
        console.error('notifications.service.service.markAllRead unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to markAllRead');
    }
  }
}
