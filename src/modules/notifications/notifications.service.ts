import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {ListNotificationDto} from './dto/list-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: number, query: ListNotificationDto) {
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 20);

      const where: any = {
        somiteeId: BigInt(somiteeId),
      };

      if (query.read !== undefined) {
        where.read = query.read === 'true';
      }

      const [data, total] = await Promise.all([
        this.prisma.notification.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {createdAt: 'desc'},
        }),
        this.prisma.notification.count({where}),
      ]);

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('notifications.list error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
          query,
        });
      } else {
        console.error('notifications.list unknown error:', error);
      }

      throw new InternalServerErrorException('Failed to list notifications');
    }
  }

  async markRead(id: number, somiteeId: number) {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: {id, somiteeId},
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      return this.prisma.notification.update({
        where: {id},
        data: {read: true},
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('notifications.service.markRead error:', {
          message: error.message,
          stack: error.stack,
          id,
          somiteeId,
        });
      } else {
        console.error('notifications.service.markRead unknown error:', error);
      }

      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Failed to markRead');
    }
  }

  async markAllRead(somiteeId: number) {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          somiteeId: BigInt(somiteeId),
          read: false,
        },
        data: {
          read: true,
        },
      });

      return {
        success: true,
        updated: result.count,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('notifications.service.markAllRead error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
        });
      } else {
        console.error('notifications.service.markAllRead unknown error:', error);
      }

      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Failed to markAllRead');
    }
  }
}
