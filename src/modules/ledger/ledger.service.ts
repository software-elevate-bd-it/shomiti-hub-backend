import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: number, query: any) {
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 20);
      const where: any = {somiteeId};
      if (query.type) where.type = query.type;
      if (query.memberId) where.memberId = query.memberId;
      if (query.dateFrom || query.dateTo) {
        where.date = {};
        if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
        if (query.dateTo) where.date.lte = new Date(query.dateTo);
      }
      const [data, total] = await Promise.all([
        this.prisma.ledgerEntry.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {date: 'desc'},
        }),
        this.prisma.ledgerEntry.count({where}),
      ]);
      return {data, meta: {page, limit, total, totalPages: Math.ceil(total / limit)}};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('ledger.service.service.list error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('ledger.service.service.list unknown error:', error);
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

  async summary(somiteeId: number, query: any) {
    try {
      return {
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        openingBalance: 0,
        closingBalance: 0,
        period: {from: query.dateFrom || null, to: query.dateTo || null},
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('ledger.service.service.summary error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('ledger.service.service.summary unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to summary');
    }
  }
}
