import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CashbookService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: string, query: any) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const where: any = { somiteeId };
    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }
    const [data, total] = await Promise.all([
      this.prisma.cashBookEntry.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { date: 'desc' } }),
      this.prisma.cashBookEntry.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async summary() {
    return {
      totalCashIn: 0,
      totalCashOut: 0,
      cashInHand: 0,
      period: { from: null, to: null }
    };
  }
}
