import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: number, query: any) {
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 10);
      const where: any = {somiteeId};
      if (query.search) {
        where.OR = [
          {memberName: {contains: query.search}},
          {transactionId: {contains: query.search}},
        ];
      }
      if (query.status) where.status = query.status;
      if (query.method) where.method = query.method;
      if (query.category) where.category = query.category;
      if (query.memberId) where.memberId = query.memberId;
      if (query.dateFrom || query.dateTo) {
        where.date = {};
        if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
        if (query.dateTo) where.date.lte = new Date(query.dateTo);
      }

      const [data, total] = await Promise.all([
        this.prisma.transaction.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {date: 'desc'},
        }),
        this.prisma.transaction.count({where}),
      ]);
      return {data, meta: {page, limit, total, totalPages: Math.ceil(total / limit)}};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('collections.service.service.list error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('collections.service.service.list unknown error:', error);
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

  async create(somiteeId: number, body: any) {
    try {
      return this.prisma.transaction.create({
        data: {...body, somiteeId, type: 'collection', status: 'pending'},
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('collections.service.service.create error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          body: body,
        });
      } else {
        console.error('collections.service.service.create unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create');
    }
  }

  async update(id: number, somiteeId: number, body: any) {
    try {
      await this.findOne(id, somiteeId);
      return this.prisma.transaction.update({where: {id}, data: body});
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('collections.service.service.update error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
          body: body,
        });
      } else {
        console.error('collections.service.service.update unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update');
    }
  }

  async remove(id: number, somiteeId: number) {
    try {
      await this.findOne(id, somiteeId);
      await this.prisma.transaction.delete({where: {id}});
      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('collections.service.service.remove error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
        });
      } else {
        console.error('collections.service.service.remove unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to remove');
    }
  }

  async changeStatus(id: number, somiteeId: number, body: any) {
    try {
      await this.findOne(id, somiteeId);
      return this.prisma.transaction.update({
        where: {id},
        data: {status: body.status, note: body.note, approvedAt: new Date()},
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('collections.service.service.changeStatus error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
          body: body,
        });
      } else {
        console.error('collections.service.service.changeStatus unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to changeStatus');
    }
  }

  async publicPay(paymentLink: string, body: any) {
    try {
      return {
        gatewayUrl: 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
        sessionKey: 'ssl-session-xyz',
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('collections.service.service.publicPay error:', {
          message: error.message,
          stack: error.stack,
          paymentLink: paymentLink,
          body: body,
        });
      } else {
        console.error('collections.service.service.publicPay unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to publicPay');
    }
  }

  async publicCallback(body: any) {
    try {
      return {
        collectionId: 't-ssl-1',
        transactionId: body.transactionId || 'SSL98765',
        status: 'approved',
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('collections.service.service.publicCallback error:', {
          message: error.message,
          stack: error.stack,
          body: body,
        });
      } else {
        console.error('collections.service.service.publicCallback unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to publicCallback');
    }
  }

  async quickPay(body: any) {
    try {
      return {
        id: 'mp-uuid',
        ...body,
        amount: 0,
        lateFee: 0,
        discount: body.discount || 0,
        totalPaid: 0,
        status: 'approved',
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('collections.service.service.quickPay error:', {
          message: error.message,
          stack: error.stack,
          body: body,
        });
      } else {
        console.error('collections.service.service.quickPay unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to quickPay');
    }
  }

  async memberStatus(memberId: number, financialYear: string) {
    try {
      return {
        memberId,
        financialYear,
        monthlyFee: 0,
        months: [],
        summary: {totalPaid: 0, totalDue: 0, paidMonths: 0, dueMonths: 0},
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('collections.service.service.memberStatus error:', {
          message: error.message,
          stack: error.stack,
          memberId: memberId,
          financialYear: financialYear,
        });
      } else {
        console.error('collections.service.service.memberStatus unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to memberStatus');
    }
  }

  private async findOne(id: number, somiteeId: number) {
    const transaction = await this.prisma.transaction.findFirst({where: {id, somiteeId}});
    if (!transaction) {
      throw new NotFoundException('Collection not found');
    }
    return transaction;
  }
}
