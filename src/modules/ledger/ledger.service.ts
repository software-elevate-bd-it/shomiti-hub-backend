import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: string, query: any) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const where: any = { somiteeId };
    if (query.type) where.type = query.type;
    if (query.memberId) where.memberId = query.memberId;
    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }
    const [data, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { date: 'desc' } }),
      this.prisma.ledgerEntry.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async summary(somiteeId: string, query: any) {
    return {
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      openingBalance: 0,
      closingBalance: 0,
      period: { from: query.dateFrom || null, to: query.dateTo || null }
    };
  }
}
