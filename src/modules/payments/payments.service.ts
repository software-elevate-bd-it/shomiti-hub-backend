import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisCacheService } from '../cache/redis-cache.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: RedisCacheService
  ) {}

  async list(somiteeId: string, query: any) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const where: any = { somiteeId };
    if (query.status) where.status = query.status;
    if (query.method) where.method = query.method;
    if (query.memberId) where.memberId = query.memberId;
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { paymentDate: 'desc' } }),
      this.prisma.payment.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async verify(id: string, somiteeId: string, body: any) {
    const payment = await this.prisma.payment.findFirst({ where: { id, somiteeId } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    const cacheKey = this.cacheService.key(somiteeId, 'payments');
    await this.cacheService.del(cacheKey);
    return this.prisma.payment.update({
      where: { id },
      data: { status: body.status, note: body.note, verifiedAt: new Date() }
    });
  }
}
