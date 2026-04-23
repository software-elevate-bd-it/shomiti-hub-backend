import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';

@Injectable()
export class SmsService {
  constructor(private readonly prisma: PrismaService) {}

  async templates() {
    try {
      return this.prisma.smsTemplate.findMany();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('sms.service.service.templates error:', {
          message: error.message,
          stack: error.stack,
        });
      } else {
        console.error('sms.service.service.templates unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to templates');
    }
  }

  async send(body: any) {
    try {
      return {sent: body.memberIds?.length || 0, failed: 0, results: []};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('sms.service.service.send error:', {
          message: error.message,
          stack: error.stack,
          body: body,
        });
      } else {
        console.error('sms.service.service.send unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to send');
    }
  }

  async sendCustom(body: any) {
    try {
      return {sent: 0, failed: 0, results: []};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('sms.service.service.sendCustom error:', {
          message: error.message,
          stack: error.stack,
          body: body,
        });
      } else {
        console.error('sms.service.service.sendCustom unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to sendCustom');
    }
  }

  async history(somiteeId: number, query: any) {
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 10);
      const where: any = {somiteeId};
      const [data, total] = await Promise.all([
        this.prisma.smsHistory.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {date: 'desc'},
        }),
        this.prisma.smsHistory.count({where}),
      ]);
      return {data, meta: {page, limit, total, totalPages: Math.ceil(total / limit)}};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('sms.service.service.history error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('sms.service.service.history unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to history');
    }
  }

  async config(somiteeId: number, body: any) {
    try {
      return this.prisma.smsConfig.upsert({
        where: {id: somiteeId},
        update: body,
        create: {id: somiteeId, ...body},
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('sms.service.service.config error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          body: body,
        });
      } else {
        console.error('sms.service.service.config unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to config');
    }
  }
}
