import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SmsService {
  constructor(private readonly prisma: PrismaService) {}

  async templates() {
    return this.prisma.smsTemplate.findMany();
  }

  async send(body: any) {
    return { sent: body.memberIds?.length || 0, failed: 0, results: [] };
  }

  async sendCustom(body: any) {
    return { sent: 0, failed: 0, results: [] };
  }

  async history(somiteeId: string, query: any) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const where: any = { somiteeId };
    const [data, total] = await Promise.all([
      this.prisma.smsHistory.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { date: 'desc' } }),
      this.prisma.smsHistory.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async config(somiteeId: string, body: any) {
    return this.prisma.smsConfig.upsert({
      where: { id: somiteeId },
      update: body,
      create: { id: somiteeId, ...body }
    });
  }
}
