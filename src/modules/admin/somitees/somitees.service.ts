import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SomiteesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: any) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const where: any = {};
    if (query.search) where.name = { contains: query.search };
    if (query.status) where.status = query.status;
    if (query.plan) where.plan = query.plan;
    const [data, total] = await Promise.all([
      this.prisma.somitee.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.somitee.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const somitee = await this.prisma.somitee.findUnique({ where: { id } });
    if (!somitee) {
      throw new NotFoundException('Somitee not found');
    }
    return somitee;
  }

  async create(body: any) {
    return this.prisma.somitee.create({ data: body });
  }

  async update(id: string, body: any) {
    await this.findOne(id);
    return this.prisma.somitee.update({ where: { id }, data: body });
  }

  async changeStatus(id: string, body: any) {
    await this.findOne(id);
    return this.prisma.somitee.update({ where: { id }, data: { status: body.status, blockedReason: body.reason } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.somitee.delete({ where: { id } });
    return null;
  }
}
