import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {ListCashbookQueryDto} from './dto/list-cashbook-query.dto';

@Injectable()
export class CashbookService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: number, query: ListCashbookQueryDto) {
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 20);

      const where: any = {
        somiteeId,
      };

      // ======================
      // SEARCH
      // ======================
      if (query.search) {
        where.OR = [
          {description: {contains: query.search}},
          {referenceType: {contains: query.search}},
          {referenceId: {contains: query.search}},
        ];
      }

      // ======================
      // DATE FILTER
      // ======================
      if (query.dateFrom || query.dateTo) {
        where.date = {};
        if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
        if (query.dateTo) where.date.lte = new Date(query.dateTo);
      }

      // ======================
      // QUERY
      // ======================
      const [data, total] = await Promise.all([
        this.prisma.cashBookEntry.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {date: 'desc'},
        }),
        this.prisma.cashBookEntry.count({where}),
      ]);

      return {
        success: true,
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('cashbook.list error:', error);
      throw new InternalServerErrorException('Failed to list cashbook');
    }
  }

  async summary(somiteeId: number, query: ListCashbookQueryDto) {
    try {
      const where: any = {somiteeId};

      if (query.dateFrom || query.dateTo) {
        where.date = {};
        if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
        if (query.dateTo) where.date.lte = new Date(query.dateTo);
      }

      const [cashIn, cashOut] = await Promise.all([
        this.prisma.cashBookEntry.aggregate({
          where,
          _sum: {cashIn: true},
        }),
        this.prisma.cashBookEntry.aggregate({
          where,
          _sum: {cashOut: true},
        }),
      ]);

      const totalCashIn = cashIn._sum.cashIn || 0;
      const totalCashOut = cashOut._sum.cashOut || 0;

      return {
        success: true,
        data: {
          totalCashIn,
          totalCashOut,
          cashInHand: totalCashIn - totalCashOut,
        },
        period: {
          from: query.dateFrom || null,
          to: query.dateTo || null,
        },
      };
    } catch (error) {
      console.error('cashbook.summary error:', error);
      throw new InternalServerErrorException('Failed to get cashbook summary');
    }
  }
}
