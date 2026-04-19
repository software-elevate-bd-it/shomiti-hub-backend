import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: any) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const where: any = {};
    if (query.action) where.action = query.action;
    if (query.userId) where.userId = query.userId;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }
    const [data, total] = await Promise.all([
      this.prisma.activityLog.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.activityLog.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
