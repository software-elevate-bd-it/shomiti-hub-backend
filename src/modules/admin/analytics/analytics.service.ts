import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    return { totalSomitees: 0, activeSomitees: 0, totalMembers: 0, totalTransactions: 0, platformRevenue: 0, growth: { somitees: '0', members: '0', revenue: '0%' } };
  }

  async revenue() {
    return { totalRevenue: 0, monthly: [], byPlan: [] };
  }
}
