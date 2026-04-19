import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: string, query: any) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const where: any = { somiteeId };
    if (query.search) {
      where.OR = [
        { memberName: { contains: query.search } },
        { transactionId: { contains: query.search } }
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
      this.prisma.transaction.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { date: 'desc' } }),
      this.prisma.transaction.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async create(somiteeId: string, body: any) {
    return this.prisma.transaction.create({ data: { ...body, somiteeId, type: 'collection', status: 'pending' } });
  }

  async update(id: string, somiteeId: string, body: any) {
    await this.findOne(id, somiteeId);
    return this.prisma.transaction.update({ where: { id }, data: body });
  }

  async remove(id: string, somiteeId: string) {
    await this.findOne(id, somiteeId);
    await this.prisma.transaction.delete({ where: { id } });
    return null;
  }

  async changeStatus(id: string, somiteeId: string, body: any) {
    await this.findOne(id, somiteeId);
    return this.prisma.transaction.update({ where: { id }, data: { status: body.status, note: body.note, approvedAt: new Date() } });
  }

  async publicPay(paymentLink: string, body: any) {
    return { gatewayUrl: 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php', sessionKey: 'ssl-session-xyz' };
  }

  async publicCallback(body: any) {
    return { collectionId: 't-ssl-1', transactionId: body.transactionId || 'SSL98765', status: 'approved' };
  }

  async quickPay(body: any) {
    return { id: 'mp-uuid', ...body, amount: 0, lateFee: 0, discount: body.discount || 0, totalPaid: 0, status: 'approved' };
  }

  async memberStatus(memberId: string, financialYear: string) {
    return {
      memberId,
      financialYear,
      monthlyFee: 0,
      months: [],
      summary: { totalPaid: 0, totalDue: 0, paidMonths: 0, dueMonths: 0 }
    };
  }

  private async findOne(id: string, somiteeId: string) {
    const transaction = await this.prisma.transaction.findFirst({ where: { id, somiteeId } });
    if (!transaction) {
      throw new NotFoundException('Collection not found');
    }
    return transaction;
  }
}
